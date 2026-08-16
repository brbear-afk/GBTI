import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

import { AnswerDto } from './answer.dto';

export class AnalyzeTestDto {
  @IsString()
  testToken!: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @ArrayUnique((answer: AnswerDto) => answer.questionId)
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}

