export const TEST_SESSION_STORAGE_KEY = 'glbti:test-session:v1';

export interface TestQuestion {
  id: string;
  category: string;
  prompt: string;
}

export interface RecommendedLength {
  minChars: number;
  targetMinChars: number;
  targetMaxChars: number;
  maxChars: number;
}

export interface TestSession {
  testId: string;
  testToken: string;
  level: 'simple';
  expiresAt: string;
  recommendedLength: RecommendedLength;
  questions: TestQuestion[];
}

export type AnalysisAxis = 'long' | 'repressed' | 'ornate' | 'concrete' | 'gloomy';

export interface AnalysisResult {
  type: string;
  profile: {
    code: string;
    name: string;
    introduction: string;
  };
  scores: Record<AnalysisAxis, number>;
  stability: Record<AnalysisAxis, 'very_high' | 'high' | 'medium' | 'low' | 'very_low'>;
  axisAnalysis: Record<
    AnalysisAxis,
    {
      summary: string;
      evidence: Array<{ questionId: string; excerpt: string }>;
    }
  >;
  samples: Array<{
    questionId: string;
    scores: Record<AnalysisAxis, number>;
    observability: Record<AnalysisAxis, 'low' | 'medium' | 'high'>;
  }>;
}

export interface AnalyzeTestResponse {
  testId: string;
  level: 'simple';
  result: AnalysisResult;
}

export const ANALYSIS_RESULT_STORAGE_KEY = 'glbti:analysis-result:v2';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export async function createSimpleTest(): Promise<TestSession> {
  const response = await fetch(`${API_BASE_URL}/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level: 'simple' }),
  });

  if (!response.ok) {
    throw new Error(`검사를 시작하지 못했습니다. (${response.status})`);
  }

  return (await response.json()) as TestSession;
}

export async function analyzeTest(
  session: TestSession,
  answers: string[],
): Promise<AnalyzeTestResponse> {
  const response = await fetch(`${API_BASE_URL}/tests/${session.testId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      testToken: session.testToken,
      answers: session.questions.map((question, index) => ({
        questionId: question.id,
        text: answers[index],
      })),
    }),
  });

  if (!response.ok) {
    const message =
      response.status === 503
        ? 'Gemini API 키가 아직 설정되지 않았습니다.'
        : response.status === 429
          ? '분석 요청이 많습니다. 잠시 후 다시 시도해 주세요.'
          : `분석을 완료하지 못했습니다. (${response.status})`;
    throw new Error(message);
  }

  return (await response.json()) as AnalyzeTestResponse;
}

export function saveAnalysisResult(result: AnalyzeTestResponse): void {
  sessionStorage.setItem(ANALYSIS_RESULT_STORAGE_KEY, JSON.stringify(result));
}

export function readAnalysisResult(): AnalyzeTestResponse | null {
  const stored = sessionStorage.getItem(ANALYSIS_RESULT_STORAGE_KEY);
  if (!stored) return null;
  try {
    const result = JSON.parse(stored) as Partial<AnalyzeTestResponse>;
    if (
      !result.result ||
      typeof result.result.type !== 'string' ||
      !result.result.profile ||
      result.result.profile.code !== result.result.type ||
      typeof result.result.profile.name !== 'string' ||
      typeof result.result.profile.introduction !== 'string'
    ) {
      return null;
    }
    return result as AnalyzeTestResponse;
  } catch {
    return null;
  }
}

export function saveTestSession(session: TestSession): void {
  sessionStorage.setItem(TEST_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function readTestSession(): TestSession | null {
  const stored = sessionStorage.getItem(TEST_SESSION_STORAGE_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as Partial<TestSession>;
    if (
      session.level !== 'simple' ||
      typeof session.testId !== 'string' ||
      typeof session.testToken !== 'string' ||
      typeof session.expiresAt !== 'string' ||
      !Array.isArray(session.questions) ||
      session.questions.length !== 4 ||
      !session.recommendedLength ||
      new Date(session.expiresAt).getTime() <= Date.now()
    ) {
      sessionStorage.removeItem(TEST_SESSION_STORAGE_KEY);
      return null;
    }
    return session as TestSession;
  } catch {
    sessionStorage.removeItem(TEST_SESSION_STORAGE_KEY);
    return null;
  }
}
