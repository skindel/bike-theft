import type { Feature, MultiPolygon, Polygon, Position } from 'geojson';
import type { NeighbourhoodFeature } from '@/features/map/neighbourhoods';

const PDOK_WFS = 'https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0';
/** Covers every Maastricht buurt. WFS 2.0 with a urn CRS expects latitude first. */
const BBOX = '50.79,5.62,50.90,5.78,urn:ogc:def:crs:EPSG::4326';
const TABLE = 'neighbourhood-data-2024';
const BOUNDARY_SOURCE = 'CBS Wijk- en Buurtkaart 2024 via PDOK';

/**
 * The table was created outside this repository and its column names are not frozen yet, so
 * they are resolved from the returned row instead of hard-coded. Replace this with the agreed
 * column names once the schema is fixed.
 */
const patterns = {
  name: /^(neighbourhood|neighborhood|buurt(naam)?|name|area)$/i,
  count: /^(count|counts|thefts?|incidents?|total|aantal)$/i,
  /** Captures the base, so "count_per_1000" is never presented as a per-100 figure. */
  rate: /per[_\s-]?(\d+)/i,
};

type CbsFeature = Feature<
  Polygon | MultiPolygon,
  { buurtcode: string; buurtnaam: string; gemeentenaam: string; water?: string }
>;
type CountRow = Record<string, unknown>;

function apiError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function normalise(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** 5 decimal places is roughly metre precision and roughly halves the payload. */
function roundCoordinates(coordinates: Position[][] | Position[][][]): typeof coordinates {
  const round = (value: unknown): unknown =>
    Array.isArray(value) ? value.map(round) : Math.round((value as number) * 1e5) / 1e5;
  return round(coordinates) as typeof coordinates;
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function resolveColumns(row: CountRow) {
  const keys = Object.keys(row);
  const find = (pattern: RegExp) => keys.find((key) => pattern.test(key)) ?? null;
  const rate = find(patterns.rate);
  return {
    name: find(patterns.name),
    count: find(patterns.count),
    rate,
    denominator: rate ? Number(rate.match(patterns.rate)![1]) : null,
    available: keys,
  };
}

async function loadBoundaries() {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: 'wijkenbuurten:buurten',
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    propertyName: 'buurtcode,buurtnaam,gemeentenaam,water,geom',
    bbox: BBOX,
  });
  const response = await fetch(`${PDOK_WFS}?${params}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 604800 },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`PDOK returned ${response.status}`);
  const data = (await response.json()) as { features?: CbsFeature[] };
  return (data.features ?? []).filter(
    (feature) =>
      feature.properties.gemeentenaam === 'Maastricht' && feature.properties.water !== 'JA',
  );
}

async function loadCounts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const response = await fetch(`${url}/rest/v1/${TABLE}?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
  return (await response.json()) as CountRow[];
}

export async function GET() {
  let boundaries: CbsFeature[];
  try {
    boundaries = await loadBoundaries();
  } catch {
    return apiError(
      503,
      'BOUNDARY_SOURCE_UNAVAILABLE',
      'Neighbourhood boundaries are temporarily unavailable.',
    );
  }
  if (boundaries.length === 0) {
    return apiError(503, 'BOUNDARY_SOURCE_EMPTY', 'No Maastricht neighbourhoods were returned.');
  }

  let rows: CountRow[] | null;
  try {
    rows = await loadCounts();
  } catch {
    return apiError(
      503,
      'STATISTICS_UNAVAILABLE',
      'Neighbourhood theft statistics are temporarily unavailable.',
    );
  }

  const columns = rows?.length ? resolveColumns(rows[0]) : null;
  if (rows?.length && columns && (!columns.name || !columns.rate)) {
    return apiError(
      500,
      'UNEXPECTED_SCHEMA',
      `Could not find a neighbourhood name column and a "per <number>" column in "${TABLE}". Columns present: ${columns.available.join(', ')}.`,
    );
  }

  const byName = new Map<string, CountRow>();
  if (rows && columns?.name) {
    for (const row of rows) {
      const name = row[columns.name];
      if (typeof name === 'string') byName.set(normalise(name), row);
    }
  }

  let matched = 0;
  let max: number | null = null;
  const features: NeighbourhoodFeature[] = boundaries.map((feature) => {
    const row = byName.get(normalise(feature.properties.buurtnaam));
    const rate = row && columns?.rate ? toNumber(row[columns.rate]) : null;
    const count = row && columns?.count ? toNumber(row[columns.count]) : null;
    if (row) matched += 1;
    if (rate !== null) max = max === null ? rate : Math.max(max, rate);
    return {
      type: 'Feature',
      properties: {
        code: feature.properties.buurtcode,
        name: feature.properties.buurtnaam,
        count,
        rate,
      },
      geometry: {
        type: feature.geometry.type,
        coordinates: roundCoordinates(feature.geometry.coordinates),
      } as Polygon | MultiPolygon,
    };
  });

  return Response.json({
    features,
    max,
    denominator: columns?.denominator ?? null,
    matched,
    total: features.length,
    connected: rows !== null,
    boundarySource: BOUNDARY_SOURCE,
    columns: columns && { name: columns.name, count: columns.count, rate: columns.rate },
  });
}
