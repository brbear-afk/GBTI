import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

import type { TestTokenPayload } from './test.types';

const DEFAULT_TOKEN_TTL_SECONDS = 30 * 60;

@Injectable()
export class TestTokenService {
  private readonly secret: string;
  private readonly ttlSeconds: number;

  constructor(config: ConfigService) {
    this.secret = config.get<string>('TEST_TOKEN_SECRET', '');
    if (this.secret.length < 32) {
      throw new Error('TEST_TOKEN_SECRET must contain at least 32 characters');
    }

    const configuredTtl = Number(
      config.get<string>('TEST_TOKEN_TTL_SECONDS', String(DEFAULT_TOKEN_TTL_SECONDS)),
    );
    if (!Number.isInteger(configuredTtl) || configuredTtl < 60 || configuredTtl > 86_400) {
      throw new Error('TEST_TOKEN_TTL_SECONDS must be an integer between 60 and 86400');
    }
    this.ttlSeconds = configuredTtl;
  }

  getTtlSeconds(): number {
    return this.ttlSeconds;
  }

  sign(payload: TestTokenPayload): string {
    const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    return `${encodedPayload}.${this.createSignature(encodedPayload)}`;
  }

  verify(token: string): TestTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 2) throw new UnauthorizedException('Invalid test token');

    const [encodedPayload, suppliedSignature] = parts;
    const expectedSignature = this.createSignature(encodedPayload);
    const suppliedBuffer = Buffer.from(suppliedSignature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(suppliedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid test token');
    }

    let payload: unknown;
    try {
      payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid test token');
    }

    if (!this.isPayload(payload) || payload.expiresAt <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Expired or invalid test token');
    }
    return payload;
  }

  private createSignature(encodedPayload: string): string {
    return createHmac('sha256', this.secret).update(encodedPayload).digest('base64url');
  }

  private isPayload(value: unknown): value is TestTokenPayload {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const payload = value as Partial<TestTokenPayload>;
    return (
      payload.version === 1 &&
      typeof payload.testId === 'string' &&
      payload.testId.length > 0 &&
      payload.level === 'simple' &&
      Array.isArray(payload.questionIds) &&
      payload.questionIds.length === 4 &&
      payload.questionIds.every((id) => typeof id === 'string' && id.length > 0) &&
      Number.isInteger(payload.issuedAt) &&
      Number.isInteger(payload.expiresAt) &&
      (payload.expiresAt ?? 0) > (payload.issuedAt ?? 0)
    );
  }
}

