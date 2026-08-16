import { IsString, MaxLength, MinLength } from 'class-validator';

export class AnswerDto {
  @IsString()
  questionId!: string;

  @IsString()
  @MinLength(100)
  @MaxLength(1200)
  text!: string;
}

