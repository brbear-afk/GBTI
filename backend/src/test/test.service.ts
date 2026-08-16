import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { AnalysisService } from '../analysis/analysis.service';
import { GeminiService } from '../gemini/gemini.service';
import { QuestionService } from '../question/question.service';
import { TypeService } from '../type/type.service';
import type { AnalyzeTestDto } from './dto/analyze-test.dto';
import type { AnalyzeTestResponseDto } from './dto/analyze-test-response.dto';
import type { CreateTestDto } from './dto/create-test.dto';
import type { CreateTestResponseDto } from './dto/create-test-response.dto';
import { TestTokenService } from './test-token.service';

@Injectable()
export class TestService {
  constructor(
    private readonly questions: QuestionService,
    private readonly tokens: TestTokenService,
    private readonly gemini: GeminiService,
    private readonly analysis: AnalysisService,
    private readonly types: TypeService,
  ) {}

  create(dto: CreateTestDto): CreateTestResponseDto {
    const selectedQuestions = this.questions.selectSimpleQuestions();
    const testId = randomUUID();
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + this.tokens.getTtlSeconds();
    const testToken = this.tokens.sign({
      version: 1,
      testId,
      level: dto.level,
      questionIds: selectedQuestions.map(({ id }) => id),
      issuedAt,
      expiresAt,
    });

    return {
      testId,
      testToken,
      level: dto.level,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      recommendedLength: this.questions.getRecommendedLength(),
      questions: this.questions.toPublicQuestions(selectedQuestions),
    };
  }

  async analyze(testId: string, dto: AnalyzeTestDto): Promise<AnalyzeTestResponseDto> {
    const payload = this.tokens.verify(dto.testToken);
    if (payload.testId !== testId) {
      throw new UnauthorizedException('Test token does not match testId');
    }

    const answersById = new Map(dto.answers.map((answer) => [answer.questionId, answer]));
    if (
      answersById.size !== payload.questionIds.length ||
      payload.questionIds.some((questionId) => !answersById.has(questionId))
    ) {
      throw new BadRequestException('Answers must match the assigned questions');
    }

    const limits = this.questions.getRecommendedLength();
    const assignedQuestions = payload.questionIds.map((questionId) => {
      const question = this.questions.getQuestion(questionId);
      if (!question) throw new UnauthorizedException('Test token contains an unknown question');
      return question;
    });

    const inputs = assignedQuestions.map((question) => {
      const answer = answersById.get(question.id);
      if (!answer) throw new BadRequestException(`Missing answer for ${question.id}`);
      const length = answer.text.trim().length;
      if (length < limits.minChars || length > limits.maxChars) {
        throw new BadRequestException(
          `Answer for ${question.id} must be ${limits.minChars} to ${limits.maxChars} characters`,
        );
      }
      return {
        questionId: question.id,
        questionPrompt: question.prompt,
        answer: answer.text,
      };
    });

    const geminiAnalysis = await this.gemini.analyze(inputs);
    const result = this.analysis.finalize(geminiAnalysis, assignedQuestions);
    return {
      testId,
      level: payload.level,
      result: {
        ...result,
        profile: this.types.getProfile(result.type),
      },
    };
  }
}
