import { Module } from '@nestjs/common';

import { QuestionModule } from '../question/question.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { GeminiModule } from '../gemini/gemini.module';
import { TypeModule } from '../type/type.module';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { TestTokenService } from './test-token.service';

@Module({
  imports: [QuestionModule, GeminiModule, AnalysisModule, TypeModule],
  controllers: [TestController],
  providers: [TestService, TestTokenService],
  exports: [TestTokenService],
})
export class TestModule {}
