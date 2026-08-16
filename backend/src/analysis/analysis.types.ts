import type {
  AnalysisAxis,
  AxisAnalysisDetail,
  AxisScores,
  GeminiSampleAnalysis,
} from '../gemini/gemini-analysis.types';

export type StabilityLevel = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

export interface FinalAnalysis {
  type: string;
  scores: AxisScores;
  stability: Record<AnalysisAxis, StabilityLevel>;
  axisAnalysis: Record<AnalysisAxis, AxisAnalysisDetail>;
  samples: GeminiSampleAnalysis[];
}

