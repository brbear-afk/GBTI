import { IsEnum } from 'class-validator';

import { TestLevel } from '../test.types';

export class CreateTestDto {
  @IsEnum(TestLevel)
  level!: TestLevel;
}

