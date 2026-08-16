import { Injectable } from '@nestjs/common';

import {
  ANALYSIS_AXES,
  type AnalysisAxis,
  type GeminiAnalysis,
  type Observability,
} from '../gemini/gemini-analysis.types';
import type { AxisWeightKey, Question } from '../question/question.types';
import type { FinalAnalysis, StabilityLevel } from './analysis.types';

const OBSERVABILITY_WEIGHTS: Record<Observability, number> = {
  high: 1,
  medium: 0.7,
  low: 0.35,
};

const AXIS_TO_WEIGHT: Record<AnalysisAxis, AxisWeightKey> = {
  long: 'sl',
  repressed: 're',
  ornate: 'po',
  concrete: 'ca',
  gloomy: 'gb',
};

const HIGH_LETTER: Record<AnalysisAxis, string> = {
  long: 'L',
  repressed: 'R',
  ornate: 'O',
  concrete: 'C',
  gloomy: 'G',
};

const LOW_LETTER: Record<AnalysisAxis, string> = {
  long: 'S',
  repressed: 'E',
  ornate: 'P',
  concrete: 'A',
  gloomy: 'B',
};

interface WeightedScore {
  score: number;
  weight: number;
}

@Injectable()
export class AnalysisService {
  finalize(analysis: GeminiAnalysis, questions: Question[]): FinalAnalysis {
    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const scores = {} as Record<AnalysisAxis, number>;
    const stability = {} as Record<AnalysisAxis, StabilityLevel>;
    const letters = {} as Record<AnalysisAxis, string>;

    for (const axis of ANALYSIS_AXES) {
      const weightedScores = analysis.samples.map((sample) => {
        const question = questionsById.get(sample.questionId);
        if (!question) throw new Error(`Missing question metadata for ${sample.questionId}`);
        return {
          score: sample.scores[axis],
          weight:
            question.weights[AXIS_TO_WEIGHT[axis]] *
            OBSERVABILITY_WEIGHTS[sample.observability[axis]],
        };
      });

      const mean = this.weightedMean(weightedScores);
      const deviation = this.weightedStandardDeviation(weightedScores, mean);
      scores[axis] = Math.min(100, Math.max(0, Math.round(mean * 10) / 10));
      stability[axis] = this.toStabilityLevel(deviation);
      letters[axis] = this.classifyAxis(axis, mean, weightedScores);
    }

    return {
      type: `${letters.long}${letters.repressed}${letters.ornate}${letters.concrete}-${letters.gloomy}`,
      scores,
      stability,
      axisAnalysis: analysis.axisAnalysis,
      samples: analysis.samples,
    };
  }

  private weightedMean(values: WeightedScore[]): number {
    const totalWeight = values.reduce((sum, value) => sum + value.weight, 0);
    if (totalWeight <= 0) throw new Error('Effective analysis weight must be positive');
    return values.reduce((sum, value) => sum + value.score * value.weight, 0) / totalWeight;
  }

  private weightedStandardDeviation(values: WeightedScore[], mean: number): number {
    const totalWeight = values.reduce((sum, value) => sum + value.weight, 0);
    const variance =
      values.reduce(
        (sum, value) => sum + value.weight * Math.pow(value.score - mean, 2),
        0,
      ) / totalWeight;
    return Math.sqrt(variance);
  }

  private classifyAxis(
    axis: AnalysisAxis,
    mean: number,
    values: WeightedScore[],
  ): string {
    if (mean > 50) return HIGH_LETTER[axis];
    if (mean < 50) return LOW_LETTER[axis];

    const highVotes = values
      .filter(({ score }) => score > 50)
      .reduce((sum, { weight }) => sum + weight, 0);
    const lowVotes = values
      .filter(({ score }) => score < 50)
      .reduce((sum, { weight }) => sum + weight, 0);
    if (highVotes > lowVotes) return HIGH_LETTER[axis];
    if (lowVotes > highVotes) return LOW_LETTER[axis];
    return HIGH_LETTER[axis];
  }

  private toStabilityLevel(deviation: number): StabilityLevel {
    if (deviation <= 7) return 'very_high';
    if (deviation <= 12) return 'high';
    if (deviation <= 20) return 'medium';
    if (deviation <= 30) return 'low';
    return 'very_low';
  }
}
