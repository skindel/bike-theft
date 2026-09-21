import type { Feature, MultiPolygon, Polygon } from 'geojson';
export type NeighbourhoodProperties = {
  code: string;
  name: string;
  count: number | null;
  /** Thefts per `denominator`, straight from the source table. */
  rate: number | null;
};
export type NeighbourhoodFeature = Feature<Polygon | MultiPolygon, NeighbourhoodProperties>;
export type NeighbourhoodData = {
  features: NeighbourhoodFeature[];
  /** Highest rate present, and the top of the colour scale. Null when no data joined. */
  max: number | null;
  /** Read from the source column name, so the legend cannot claim the wrong base. */
  denominator: number | null;
  matched: number;
  connected: boolean;
  period: string | null;
};
/** Sequential ramp, interpolated linearly. See RISK_METHOD.md for how a colour maps to a value. */
const ramp: [number, number, number][] = [
  [45, 212, 191],
  [250, 204, 21],
  [251, 146, 60],
  [248, 113, 113],
  [225, 29, 72],
];
const noData: [number, number, number, number] = [148, 163, 184, 60];
export function colorForRate(
  value: number | null,
  max: number | null,
): [number, number, number, number] {
  if (value === null || !Number.isFinite(value) || max === null || max <= 0) return noData;
  const position = Math.min(1, Math.max(0, value / max)) * (ramp.length - 1);
  const index = Math.min(ramp.length - 2, Math.floor(position));
  const fraction = position - index;
  const from = ramp[index];
  const to = ramp[index + 1];
  return [
    Math.round(from[0] + (to[0] - from[0]) * fraction),
    Math.round(from[1] + (to[1] - from[1]) * fraction),
    Math.round(from[2] + (to[2] - from[2]) * fraction),
    150,
  ];
}
export function rampCss() {
  return ramp.map((color) => `rgb(${color[0]},${color[1]},${color[2]})`);
}
