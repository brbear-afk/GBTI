export enum TestLevel {
  SIMPLE = 'simple',
}

export interface TestTokenPayload {
  version: 1;
  testId: string;
  level: TestLevel;
  questionIds: string[];
  issuedAt: number;
  expiresAt: number;
}

