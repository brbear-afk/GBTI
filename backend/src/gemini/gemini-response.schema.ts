const scoreProperties = {
  long: { type: 'integer', minimum: 0, maximum: 100 },
  repressed: { type: 'integer', minimum: 0, maximum: 100 },
  ornate: { type: 'integer', minimum: 0, maximum: 100 },
  concrete: { type: 'integer', minimum: 0, maximum: 100 },
  gloomy: { type: 'integer', minimum: 0, maximum: 100 },
};

const observabilityProperties = Object.fromEntries(
  Object.keys(scoreProperties).map((axis) => [
    axis,
    { type: 'string', enum: ['low', 'medium', 'high'] },
  ]),
);

const axisDetail = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'evidence'],
  properties: {
    summary: { type: 'string' },
    evidence: {
      type: 'array',
      maxItems: 2,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['questionId', 'excerpt'],
        properties: {
          questionId: { type: 'string' },
          excerpt: { type: 'string' },
        },
      },
    },
  },
};

export const GEMINI_ANALYSIS_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'samples', 'axisAnalysis'],
  propertyOrdering: ['schemaVersion', 'samples', 'axisAnalysis'],
  properties: {
    schemaVersion: { type: 'string', enum: ['glbti-analysis-v1'] },
    samples: {
      type: 'array',
      minItems: 1,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['questionId', 'scores', 'observability'],
        propertyOrdering: ['questionId', 'scores', 'observability'],
        properties: {
          questionId: { type: 'string' },
          scores: {
            type: 'object',
            additionalProperties: false,
            required: Object.keys(scoreProperties),
            properties: scoreProperties,
          },
          observability: {
            type: 'object',
            additionalProperties: false,
            required: Object.keys(observabilityProperties),
            properties: observabilityProperties,
          },
        },
      },
    },
    axisAnalysis: {
      type: 'object',
      additionalProperties: false,
      required: Object.keys(scoreProperties),
      properties: Object.fromEntries(
        Object.keys(scoreProperties).map((axis) => [axis, axisDetail]),
      ),
    },
  },
} as const;
