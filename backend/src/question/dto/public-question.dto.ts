import type { Question, QuestionBankAnchor } from '../question.types';

export class PublicQuestionDto {
  id: string;
  category: string;
  prompt: string;

  constructor(question: Question, anchor: QuestionBankAnchor) {
    this.id = question.id;
    this.category = anchor.name;
    this.prompt = question.prompt;
  }
}

