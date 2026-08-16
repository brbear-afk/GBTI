import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

import rawQuestionBank from './bank/question-bank-mvp.json';
import { PublicQuestionDto } from './dto/public-question.dto';
import { validateQuestionBank } from './question-bank.validator';
import { QUESTION_ANCHORS, type Question, type QuestionBank } from './question.types';

@Injectable()
export class QuestionService {
  private readonly bank: QuestionBank = validateQuestionBank(rawQuestionBank as unknown);
  private readonly questionsById = new Map(
    this.bank.anchors.flatMap((anchor) => anchor.questions).map((question) => [question.id, question]),
  );

  selectSimpleQuestions(): Question[] {
    return QUESTION_ANCHORS.map((anchorId) => {
      const anchor = this.bank.anchors.find(({ id }) => id === anchorId);
      if (!anchor) throw new Error(`Question bank is missing anchor ${anchorId}`);
      return anchor.questions[randomInt(anchor.questions.length)];
    });
  }

  toPublicQuestions(questions: Question[]): PublicQuestionDto[] {
    return questions.map((question) => {
      const anchor = this.bank.anchors.find(({ id }) => id === question.anchor);
      if (!anchor) throw new Error(`Question ${question.id} references an unknown anchor`);
      return new PublicQuestionDto(question, anchor);
    });
  }

  hasQuestion(questionId: string): boolean {
    return this.questionsById.has(questionId);
  }

  getQuestion(questionId: string): Question | undefined {
    return this.questionsById.get(questionId);
  }

  getRecommendedLength(): QuestionBank['recommendedLength'] {
    return { ...this.bank.recommendedLength };
  }
}
