import type { PublicQuestionDto } from '../../question/dto/public-question.dto';
import type { RecommendedLength } from '../../question/question.types';
import type { TestLevel } from '../test.types';

export class CreateTestResponseDto {
  testId!: string;
  testToken!: string;
  level!: TestLevel;
  expiresAt!: string;
  recommendedLength!: RecommendedLength;
  questions!: PublicQuestionDto[];
}

