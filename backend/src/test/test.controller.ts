import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AnalyzeTestDto } from './dto/analyze-test.dto';
import { AnalyzeTestResponseDto } from './dto/analyze-test-response.dto';
import { CreateTestDto } from './dto/create-test.dto';
import { CreateTestResponseDto } from './dto/create-test-response.dto';
import { TestService } from './test.service';

@Controller('tests')
export class TestController {
  constructor(private readonly tests: TestService) {}

  @Post()
  create(@Body() dto: CreateTestDto): CreateTestResponseDto {
    return this.tests.create(dto);
  }

  @Post(':testId/analyze')
  @UseGuards(ThrottlerGuard)
  analyze(
    @Param('testId') testId: string,
    @Body() dto: AnalyzeTestDto,
  ): Promise<AnalyzeTestResponseDto> {
    return this.tests.analyze(testId, dto);
  }
}
