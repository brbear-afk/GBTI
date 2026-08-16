import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { QuestionService } = require('../dist/question/question.service');
const { validateQuestionBank } = require('../dist/question/question-bank.validator');
const { TestTokenService } = require('../dist/test/test-token.service');

const questions = new QuestionService();
const expectedAnchors = ['description', 'dialogue', 'event', 'introspection'];
const seenIds = new Set();

for (let run = 0; run < 50; run += 1) {
  const selected = questions.selectSimpleQuestions();
  assert.equal(selected.length, 4);
  assert.deepEqual(selected.map(({ anchor }) => anchor), expectedAnchors);
  assert.equal(new Set(selected.map(({ id }) => id)).size, 4);
  selected.forEach(({ id }) => seenIds.add(id));

  const publicQuestions = questions.toPublicQuestions(selected);
  publicQuestions.forEach((question) => {
    assert.deepEqual(Object.keys(question).sort(), ['category', 'id', 'prompt']);
  });
}

assert.ok(seenIds.size > 4, 'random selection should produce more than one fixed set');

const bankUrl = new URL('../src/question/bank/question-bank-mvp.json', import.meta.url);
const malformedBank = JSON.parse(readFileSync(bankUrl, 'utf8'));
malformedBank.anchors[1].questions[0].id = malformedBank.anchors[0].questions[0].id;
assert.throws(() => validateQuestionBank(malformedBank), /Invalid question bank/);

const secret = 'question-module-verification-secret-2026';
const tokens = new TestTokenService({
  get(key, fallback) {
    return key === 'TEST_TOKEN_SECRET' ? secret : fallback;
  },
});
const issuedAt = Math.floor(Date.now() / 1000);
const payload = {
  version: 1,
  testId: 'verification-test-id',
  level: 'simple',
  questionIds: questions.selectSimpleQuestions().map(({ id }) => id),
  issuedAt,
  expiresAt: issuedAt + tokens.getTtlSeconds(),
};
const token = tokens.sign(payload);
assert.deepEqual(tokens.verify(token), payload);
const tamperedSuffix = token.endsWith('x') ? 'y' : 'x';
assert.throws(() => tokens.verify(`${token.slice(0, -1)}${tamperedSuffix}`));

console.log(
  JSON.stringify({
    questionBankValidated: true,
    anchorsSelected: expectedAnchors,
    distinctQuestionsObserved: seenIds.size,
    publicDtoFields: ['id', 'category', 'prompt'],
    signedTokenVerified: true,
    tamperedTokenRejected: true,
  }),
);
