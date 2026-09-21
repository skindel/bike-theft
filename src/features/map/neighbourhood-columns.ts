export type CountRow = Record<string, unknown>;
export type ResolvedColumns = {
  name: string | null;
  count: string | null;
  rate: string | null;
  denominator: number | null;
  available: string[];
};

const NAME_KEYS = ['neighbourhood', 'neighborhood', 'buurtnaam', 'buurt', 'name', 'area'];
const COUNT_KEYS = ['count', 'counts', 'thefts', 'incidents', 'total', 'aantal'];
const RATE_KEYS = [
  'count per 1000',
  'count_per_1000',
  'count-per-1000',
  'countper1000',
  'per_1000',
  'per1000',
];

function matchKey(keys: string[], candidates: string[]) {
  const lower = new Map(keys.map((key) => [key.toLowerCase().replace(/[_-]+/g, ' ').trim(), key]));
  for (const candidate of candidates) {
    const found = lower.get(candidate.toLowerCase().replace(/[_-]+/g, ' ').trim());
    if (found) return found;
  }
  return null;
}

function rateFromName(column: string | null) {
  if (!column) return { rate: null, denominator: null };
  const match = column.match(/per[\s_-]*(\d+)/i) ?? column.match(/(\d{3,4})\s*$/);
  return { rate: column, denominator: match ? Number(match[1]) : 1000 };
}

export function resolveColumns(row: CountRow): ResolvedColumns {
  const available = Object.keys(row);
  const name = matchKey(available, NAME_KEYS);
  const count = matchKey(available, COUNT_KEYS);
  const namedRate = matchKey(available, RATE_KEYS);
  const fallbackRate =
    namedRate ??
    available.find(
      (key) => /per[\s_-]*\d+/i.test(key) && !/^(count|thefts?|incidents?)$/i.test(key),
    ) ??
    null;
  const { rate, denominator } = rateFromName(fallbackRate);
  return { name, count, rate, denominator, available };
}
