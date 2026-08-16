import type { TypeProfile } from './type.types';

const EXPECTED_CODES = new Set(
  ['S', 'L'].flatMap((length) =>
    ['R', 'E'].flatMap((emotion) =>
      ['P', 'O'].flatMap((expression) =>
        ['C', 'A'].flatMap((focus) =>
          ['G', 'B'].map((mood) => `${length}${emotion}${expression}${focus}-${mood}`),
        ),
      ),
    ),
  ),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateTypeProfiles(value: unknown): TypeProfile[] {
  if (!Array.isArray(value) || value.length !== EXPECTED_CODES.size) {
    throw new Error(`Type profiles must contain exactly ${EXPECTED_CODES.size} entries`);
  }

  const seen = new Set<string>();
  const profiles = value.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Type profile at index ${index} must be an object`);
    const { code, name, introduction } = item;
    if (
      typeof code !== 'string' ||
      typeof name !== 'string' ||
      typeof introduction !== 'string' ||
      !code.trim() ||
      !name.trim() ||
      !introduction.trim()
    ) {
      throw new Error(`Type profile at index ${index} has invalid fields`);
    }
    if (!EXPECTED_CODES.has(code)) throw new Error(`Unknown type profile code: ${code}`);
    if (seen.has(code)) throw new Error(`Duplicate type profile code: ${code}`);
    seen.add(code);
    return { code, name, introduction };
  });

  const missing = [...EXPECTED_CODES].filter((code) => !seen.has(code));
  if (missing.length > 0) throw new Error(`Missing type profile codes: ${missing.join(', ')}`);
  return profiles;
}
