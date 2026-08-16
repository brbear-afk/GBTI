import {
  AXIS_WEIGHT_KEYS,
  QUESTION_ANCHORS,
  type AxisWeights,
  type Question,
  type QuestionAnchor,
  type QuestionBank,
  type QuestionBankAnchor,
  type RecommendedLength,
} from './question.types';

const QUESTION_ID_PREFIX: Record<QuestionAnchor, string> = {
  description: 'DESC',
  dialogue: 'DIAL',
  event: 'EVNT',
  introspection: 'INTR',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fail(path: string, message: string): never {
  throw new Error(`Invalid question bank at ${path}: ${message}`);
}

function assertRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) fail(path, 'expected an object');
  return value;
}

function assertExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
  path: string,
): void {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(path, `expected keys ${expected.join(', ')}, received ${actual.join(', ')}`);
  }
}

function readString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(path, 'expected a non-empty string');
  }
  return value;
}

function readInteger(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    fail(path, 'expected an integer');
  }
  return value;
}

function readRecommendedLength(value: unknown): RecommendedLength {
  const record = assertRecord(value, 'recommendedLength');
  assertExactKeys(
    record,
    ['minChars', 'targetMinChars', 'targetMaxChars', 'maxChars'],
    'recommendedLength',
  );

  const length = {
    minChars: readInteger(record.minChars, 'recommendedLength.minChars'),
    targetMinChars: readInteger(record.targetMinChars, 'recommendedLength.targetMinChars'),
    targetMaxChars: readInteger(record.targetMaxChars, 'recommendedLength.targetMaxChars'),
    maxChars: readInteger(record.maxChars, 'recommendedLength.maxChars'),
  };

  if (
    length.minChars < 1 ||
    length.minChars > length.targetMinChars ||
    length.targetMinChars > length.targetMaxChars ||
    length.targetMaxChars > length.maxChars
  ) {
    fail('recommendedLength', 'character limits must be positive and ascending');
  }

  return length;
}

function readWeights(value: unknown, path: string): AxisWeights {
  const record = assertRecord(value, path);
  assertExactKeys(record, AXIS_WEIGHT_KEYS, path);

  return Object.fromEntries(
    AXIS_WEIGHT_KEYS.map((key) => {
      const weight = record[key];
      if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0 || weight > 2) {
        fail(`${path}.${key}`, 'expected a number greater than 0 and at most 2');
      }
      return [key, weight];
    }),
  ) as AxisWeights;
}

function readQuestion(value: unknown, anchor: QuestionAnchor, index: number): Question {
  const path = `anchors.${anchor}.questions[${index}]`;
  const record = assertRecord(value, path);
  assertExactKeys(record, ['id', 'anchor', 'prompt', 'tags', 'weights'], path);

  const id = readString(record.id, `${path}.id`);
  const expectedIdPattern = new RegExp(`^${QUESTION_ID_PREFIX[anchor]}_\\d{3}$`);
  if (!expectedIdPattern.test(id)) {
    fail(`${path}.id`, `expected ${QUESTION_ID_PREFIX[anchor]}_NNN format`);
  }
  if (record.anchor !== anchor) {
    fail(`${path}.anchor`, `expected ${anchor}`);
  }
  if (!Array.isArray(record.tags) || record.tags.length === 0) {
    fail(`${path}.tags`, 'expected at least one tag');
  }

  const tags = record.tags.map((tag, tagIndex) =>
    readString(tag, `${path}.tags[${tagIndex}]`),
  );

  return {
    id,
    anchor,
    prompt: readString(record.prompt, `${path}.prompt`),
    tags,
    weights: readWeights(record.weights, `${path}.weights`),
  };
}

function readAnchor(value: unknown, expectedAnchor: QuestionAnchor, index: number): QuestionBankAnchor {
  const path = `anchors[${index}]`;
  const record = assertRecord(value, path);
  assertExactKeys(record, ['id', 'name', 'description', 'questions'], path);

  if (record.id !== expectedAnchor) {
    fail(`${path}.id`, `expected ${expectedAnchor}`);
  }
  if (!Array.isArray(record.questions) || record.questions.length === 0) {
    fail(`${path}.questions`, 'expected at least one question');
  }

  return {
    id: expectedAnchor,
    name: readString(record.name, `${path}.name`),
    description: readString(record.description, `${path}.description`),
    questions: record.questions.map((question, questionIndex) =>
      readQuestion(question, expectedAnchor, questionIndex),
    ),
  };
}

export function validateQuestionBank(value: unknown): QuestionBank {
  const record = assertRecord(value, 'root');
  assertExactKeys(record, ['version', 'language', 'recommendedLength', 'anchors'], 'root');

  if (!Array.isArray(record.anchors) || record.anchors.length !== QUESTION_ANCHORS.length) {
    fail('anchors', `expected exactly ${QUESTION_ANCHORS.length} anchors`);
  }

  const anchorsById = new Map<string, unknown>();
  record.anchors.forEach((anchor, index) => {
    const anchorRecord = assertRecord(anchor, `anchors[${index}]`);
    const id = readString(anchorRecord.id, `anchors[${index}].id`);
    if (anchorsById.has(id)) fail(`anchors[${index}].id`, `duplicate anchor id ${id}`);
    anchorsById.set(id, anchor);
  });

  const anchors = QUESTION_ANCHORS.map((anchor, index) => {
    const rawAnchor = anchorsById.get(anchor);
    if (!rawAnchor) fail('anchors', `missing required anchor ${anchor}`);
    return readAnchor(rawAnchor, anchor, index);
  });

  const ids = new Set<string>();
  for (const question of anchors.flatMap((anchor) => anchor.questions)) {
    if (ids.has(question.id)) fail('questions', `duplicate question id ${question.id}`);
    ids.add(question.id);
  }

  return {
    version: readString(record.version, 'version'),
    language: readString(record.language, 'language'),
    recommendedLength: readRecommendedLength(record.recommendedLength),
    anchors,
  };
}

