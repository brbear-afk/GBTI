import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { AnalysisService } = require('../dist/analysis/analysis.service');
const { validateGeminiAnalysis } = require('../dist/gemini/gemini-response.validator');
const { QuestionService } = require('../dist/question/question.service');
const { TestService } = require('../dist/test/test.service');
const { TestTokenService } = require('../dist/test/test-token.service');
const { TypeService } = require('../dist/type/type.service');

const axes = ['long', 'repressed', 'ornate', 'concrete', 'gloomy'];
const scoreTemplate = {
  long: 80,
  repressed: 65,
  ornate: 70,
  concrete: 55,
  gloomy: 40,
};

function buildGeminiResponse(inputs) {
  const firstExcerpt = inputs[0].answer.slice(0, 20);
  return {
    schemaVersion: 'glbti-analysis-v1',
    samples: inputs.map(({ questionId }) => ({
      questionId,
      scores: { ...scoreTemplate },
      observability: Object.fromEntries(axes.map((axis) => [axis, 'high'])),
    })),
    axisAnalysis: Object.fromEntries(
      axes.map((axis) => [
        axis,
        {
          summary: `${axis} 축에 대한 검증용 분석 요약입니다.`,
          evidence: [{ questionId: inputs[0].questionId, excerpt: firstExcerpt }],
        },
      ]),
    ),
  };
}

const questionService = new QuestionService();
const tokenService = new TestTokenService({
  get(key, fallback) {
    return key === 'TEST_TOKEN_SECRET' ? 'analysis-pipeline-verification-secret-2026' : fallback;
  },
});
const analysisService = new AnalysisService();
const typeService = new TypeService();
const fakeGemini = {
  async analyze(inputs) {
    return validateGeminiAnalysis(buildGeminiResponse(inputs), inputs);
  },
};
const testService = new TestService(
  questionService,
  tokenService,
  fakeGemini,
  analysisService,
  typeService,
);

const created = testService.create({ level: 'simple' });
const answers = created.questions.map(({ id }, index) => ({
  questionId: id,
  text: `${index + 1}번 답안입니다. `.repeat(20),
}));
const analyzed = await testService.analyze(created.testId, {
  testToken: created.testToken,
  answers,
});

assert.equal(analyzed.testId, created.testId);
assert.equal(analyzed.result.type, 'LROC-B');
assert.deepEqual(analyzed.result.profile, {
  code: 'LROC-B',
  name: '따뜻한 풍경화가',
  introduction: '세밀하고 풍성한 묘사로 익숙한 세계의 아름다움과 온기를 오래 바라보는 글.',
});
assert.deepEqual(analyzed.result.scores, scoreTemplate);
assert.ok(Object.values(analyzed.result.stability).every((level) => level === 'very_high'));

await assert.rejects(
  () =>
    testService.analyze(created.testId, {
      testToken: created.testToken,
      answers: answers.map((answer, index) =>
        index === 0 ? { ...answer, questionId: 'DESC_999' } : answer,
      ),
    }),
  /Answers must match/,
);

const invalidResponse = buildGeminiResponse(
  created.questions.map((question, index) => ({
    questionId: question.id,
    questionPrompt: question.prompt,
    answer: answers[index].text,
  })),
);
invalidResponse.samples[0].scores.long = 101;
assert.throws(
  () =>
    validateGeminiAnalysis(
      invalidResponse,
      created.questions.map((question, index) => ({
        questionId: question.id,
        questionPrompt: question.prompt,
        answer: answers[index].text,
      })),
    ),
  /Invalid Gemini response/,
);

console.log(
  JSON.stringify({
    submissionTokenVerified: true,
    answerIdsVerified: true,
    geminiSchemaVerified: true,
    invalidScoreRejected: true,
    weightedScoresCalculated: analyzed.result.scores,
    typeClassified: analyzed.result.type,
    stabilityCalculated: true,
  }),
);
