export const QUESTION_ANCHORS = [
  'description',
  'dialogue',
  'event',
  'introspection',
] as const;

export const AXIS_WEIGHT_KEYS = ['sl', 're', 'po', 'ca', 'gb'] as const;

export type QuestionAnchor = (typeof QUESTION_ANCHORS)[number];
export type AxisWeightKey = (typeof AXIS_WEIGHT_KEYS)[number];

export type AxisWeights = Record<AxisWeightKey, number>;

export interface Question {
  id: string;
  anchor: QuestionAnchor;
  prompt: string;
  tags: string[];
  weights: AxisWeights;
}

export interface QuestionBankAnchor {
  id: QuestionAnchor;
  name: string;
  description: string;
  questions: Question[];
}

export interface RecommendedLength {
  minChars: number;
  targetMinChars: number;
  targetMaxChars: number;
  maxChars: number;
}

export interface QuestionBank {
  version: string;
  language: string;
  recommendedLength: RecommendedLength;
  anchors: QuestionBankAnchor[];
}

