import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import type { Color } from '@deck.gl/core';
export type TheftHeatPoint = { coordinates: [number, number]; weight: number };
const heatColors: Color[] = [
  [45, 212, 191, 40],
  [94, 234, 212, 110],
  [250, 204, 21, 170],
  [251, 146, 60, 205],
  [248, 113, 113, 230],
  [225, 29, 72, 255],
];
export function theftHeatmapLayer(points: TheftHeatPoint[], visible: boolean) {
  return new HeatmapLayer<TheftHeatPoint>({
    id: 'theft-heatmap',
    data: points,
    visible,
    getPosition: (point) => point.coordinates,
    getWeight: (point) => point.weight,
    colorRange: heatColors,
    radiusPixels: 55,
    intensity: 1,
    threshold: 0.06,
    aggregation: 'SUM',
    pickable: false,
    // HeatmapLayer's aggregated texture only regenerates `debounceTimeout` ms after the
    // viewport stops changing; until then the old texture is stretched over the new zoom,
    // making points visibly balloon or shrink mid-gesture before snapping to their true
    // (zoom-independent) size. Recomputing immediately removes that stretch-and-snap.
    debounceTimeout: 0,
  });
}
