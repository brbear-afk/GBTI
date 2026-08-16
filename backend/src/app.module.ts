import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AnalysisModule } from './analysis/analysis.module';
import { AppController } from './app.controller';
import { GeminiModule } from './gemini/gemini.module';
import { QuestionModule } from './question/question.module';
import { TestModule } from './test/test.module';
import { TypeModule } from './type/type.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      errorMessage: '분석 요청은 IP당 5분 동안 최대 4회까지 가능합니다.',
      throttlers: [
        {
          ttl: 5 * 60 * 1000,
          limit: 4,
        },
      ],
    }),
    QuestionModule,
    TestModule,
    GeminiModule,
    AnalysisModule,
    TypeModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
