import {
  ANALYSIS_AXES,
  OBSERVABILITY_LEVELS,
  type AnalysisInput,
  type AxisAnalysisDetail,
  type AxisObservability,
  type AxisScores,
  type GeminiAnalysis,
  type GeminiSampleAnalysis,
} from './gemini-analysis.types';

export class GeminiResponseValidationError extends Error {}

function fail(path: string, message: string): never {
  throw new GeminiResponseValidationError(`Invalid Gemini response at ${path}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) fail(path, 'expected an object');
  return value;
}

function assertExactKeys(
  record: Record<string, unknown>,
  expectedKeys: readonly string[],
  path: string,
): void {
  const actual = Object.keys(record).sort();
  const expected = [...expectedKeys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(path, `expected keys ${expected.join(', ')}`);
  }
}

function readScores(value: unknown, path: string): AxisScores {
  const record = readRecord(value, path);
  assertExactKeys(record, ANALYSIS_AXES, path);
  return Object.fromEntries(
    ANALYSIS_AXES.map((axis) => {
      const score = record[axis];
      if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 100) {
        fail(`${path}.${axis}`, 'expected an integer between 0 and 100');
      }
      return [axis, score];
    }),
  ) as AxisScores;
}

function readObservability(value: unknown, path: string): AxisObservability {
  const record = readRecord(value, path);
  assertExactKeys(record, ANALYSIS_AXES, path);
  return Object.fromEntries(
    ANALYSIS_AXES.map((axis) => {
      const level = record[axis];
      if (!OBSERVABILITY_LEVELS.includes(level as never)) {
        fail(`${path}.${axis}`, 'expected low, medium, or high');
      }
      return [axis, level];
    }),
  ) as AxisObservability;
}

function readAxisDetail(
  value: unknown,
  path: string,
  answersById: Map<string, string>,
): AxisAnalysisDetail {
  const record = readRecord(value, path);
  assertExactKeys(record, ['summary', 'evidence'], path);
  if (typeof record.summary !== 'string' || record.summary.length === 0 || record.summary.length > 300) {
    fail(`${path}.summary`, 'expected 1 to 300 characters');
  }
  if (!Array.isArray(record.evidence) || record.evidence.length > 2) {
    fail(`${path}.evidence`, 'expected at most two items');
  }

  const evidence = record.evidence.map((item, index) => {
    const evidencePath = `${path}.evidence[${index}]`;
    const evidenceRecord = readRecord(item, evidencePath);
    assertExactKeys(evidenceRecord, ['questionId', 'excerpt'], evidencePath);
    if (typeof evidenceRecord.questionId !== 'string' || !answersById.has(evidenceRecord.questionId)) {
      fail(`${evidencePath}.questionId`, 'expected a submitted question id');
    }
    if (
      typeof evidenceRecord.excerpt !== 'string' ||
      evidenceRecord.excerpt.length === 0 ||
      evidenceRecord.excerpt.length > 150
    ) {
      fail(`${evidencePath}.excerpt`, 'expected 1 to 150 characters');
    }
    const normalizedAnswer = answersById.get(evidenceRecord.questionId)?.normalize('NFC') ?? '';
    if (!normalizedAnswer.includes(evidenceRecord.excerpt.normalize('NFC'))) {
      fail(`${evidencePath}.excerpt`, 'excerpt must exist verbatim in the submitted answer');
    }
    return {
      questionId: evidenceRecord.questionId,
      excerpt: evidenceRecord.excerpt,
    };
  });

  return { summary: record.summary, evidence };
}

export function validateGeminiAnalysis(value: unknown, inputs: AnalysisInput[]): GeminiAnalysis {
  const root = readRecord(value, 'root');
  assertExactKeys(root, ['schemaVersion', 'samples', 'axisAnalysis'], 'root');
  if (root.schemaVersion !== 'glbti-analysis-v1') {
    fail('schemaVersion', 'unsupported schema version');
  }
  if (!Array.isArray(root.samples) || root.samples.length !== inputs.length) {
    fail('samples', `expected exactly ${inputs.length} samples`);
  }

  const answersById = new Map(inputs.map(({ questionId, answer }) => [questionId, answer]));
  const expectedIds = new Set(answersById.keys());
  const seenIds = new Set<string>();
  const samples: GeminiSampleAnalysis[] = root.samples.map((item, index) => {
    const path = `samples[${index}]`;
    const record = readRecord(item, path);
    assertExactKeys(record, ['questionId', 'scores', 'observability'], path);
    if (typeof record.questionId !== 'string' || !expectedIds.has(record.questionId)) {
      fail(`${path}.questionId`, 'expected a submitted question id');
    }
    if (seenIds.has(record.questionId)) fail(`${path}.questionId`, 'duplicate question id');
    seenIds.add(record.questionId);
    return {
      questionId: record.questionId,
      scores: readScores(record.scores, `${path}.scores`),
      observability: readObservability(record.observability, `${path}.observability`),
    };
  });

  const axisRecord = readRecord(root.axisAnalysis, 'axisAnalysis');
  assertExactKeys(axisRecord, ANALYSIS_AXES, 'axisAnalysis');
  const axisAnalysis = Object.fromEntries(
    ANALYSIS_AXES.map((axis) => [
      axis,
      readAxisDetail(axisRecord[axis], `axisAnalysis.${axis}`, answersById),
    ]),
  ) as GeminiAnalysis['axisAnalysis'];

  return { schemaVersion: 'glbti-analysis-v1', samples, axisAnalysis };
}

