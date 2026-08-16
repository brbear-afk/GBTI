import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiError, GoogleGenAI } from '@google/genai';

import type { AnalysisInput, GeminiAnalysis } from './gemini-analysis.types';
import { GEMINI_ANALYSIS_RESPONSE_SCHEMA } from './gemini-response.schema';
import {
  GeminiResponseValidationError,
  validateGeminiAnalysis,
} from './gemini-response.validator';
import { ANALYSIS_SYSTEM_PROMPT } from './prompts/analysis-system.prompt';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_TIMEOUT_MS = 45_000;

@Injectable()
export class GeminiService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get<string>('GEMINI_API_KEY', '').trim();
    this.model = config.get<string>('GEMINI_MODEL', DEFAULT_MODEL);
    const timeout = Number(config.get<string>('GEMINI_TIMEOUT_MS', String(DEFAULT_TIMEOUT_MS)));
    if (!Number.isInteger(timeout) || timeout < 5_000 || timeout > 120_000) {
      throw new Error('GEMINI_TIMEOUT_MS must be an integer between 5000 and 120000');
    }
    this.timeoutMs = timeout;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async analyze(inputs: AnalysisInput[]): Promise<GeminiAnalysis> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Gemini API is not configured');
    }

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const client = new GoogleGenAI({ apiKey: this.apiKey });
        const response = await client.models.generateContent({
          model: this.model,
          contents: this.buildUserPrompt(inputs),
          config: {
            systemInstruction: ANALYSIS_SYSTEM_PROMPT,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseJsonSchema: GEMINI_ANALYSIS_RESPONSE_SCHEMA,
            httpOptions: { timeout: this.timeoutMs },
          },
        });

        if (!response.text) throw new GeminiResponseValidationError('Gemini returned no text');
        let parsed: unknown;
        try {
          parsed = JSON.parse(response.text);
        } catch {
          throw new GeminiResponseValidationError('Gemini returned invalid JSON');
        }
        return validateGeminiAnalysis(parsed, inputs);
      } catch (error) {
        lastError = error;
        if (!this.shouldRetry(error) || attempt === 1) break;
      }
    }

    this.throwMappedError(lastError);
  }

  private buildUserPrompt(inputs: AnalysisInput[]): string {
    return [
      '아래 JSON 배열의 각 답안을 분석하라.',
      'questionPrompt는 사용자에게 주어진 조건이고 answer만 사용자의 문체 표본이다.',
      '<writing_samples>',
      JSON.stringify(inputs),
      '</writing_samples>',
    ].join('\n');
  }

  private shouldRetry(error: unknown): boolean {
    return (
      error instanceof GeminiResponseValidationError ||
      (error instanceof ApiError && (error.status === 429 || error.status >= 500))
    );
  }

  private throwMappedError(error: unknown): never {
    if (error instanceof ApiError && error.status === 429) {
      throw new HttpException('Gemini request limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (error instanceof Error && /timeout|timed out|abort/i.test(error.message)) {
      throw new GatewayTimeoutException('Gemini analysis timed out');
    }
    throw new BadGatewayException('Gemini analysis failed');
  }
}
