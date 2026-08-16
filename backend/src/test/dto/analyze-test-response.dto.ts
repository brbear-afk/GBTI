import type { FinalAnalysis } from '../../analysis/analysis.types';
import type { TypeProfile } from '../../type/type.types';
import type { TestLevel } from '../test.types';

export class AnalyzeTestResponseDto {
  testId!: string;
  level!: TestLevel;
  result!: FinalAnalysis & { profile: TypeProfile };
}
