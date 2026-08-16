export const ANALYSIS_AXES = [
  'long',
  'repressed',
  'ornate',
  'concrete',
  'gloomy',
] as const;

export const OBSERVABILITY_LEVELS = ['low', 'medium', 'high'] as const;

export type AnalysisAxis = (typeof ANALYSIS_AXES)[number];
export type Observability = (typeof OBSERVABILITY_LEVELS)[number];
export type AxisScores = Record<AnalysisAxis, number>;
export type AxisObservability = Record<AnalysisAxis, Observability>;

export interface AnalysisInput {
  questionId: string;
  questionPrompt: string;
  answer: string;
}

export interface GeminiSampleAnalysis {
  questionId: string;
  scores: AxisScores;
  observability: AxisObservability;
}

export interface AxisEvidence {
  questionId: string;
  excerpt: string;
}

export interface AxisAnalysisDetail {
  summary: string;
  evidence: AxisEvidence[];
}

export interface GeminiAnalysis {
  schemaVersion: 'glbti-analysis-v1';
  samples: GeminiSampleAnalysis[];
  axisAnalysis: Record<AnalysisAxis, AxisAnalysisDetail>;
}

