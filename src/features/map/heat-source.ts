import type { TheftHeatPoint } from './theft-heatmap';
export type HeatSourceResult = { points: TheftHeatPoint[]; connected: boolean };
export async function loadTheftHeatPoints(): Promise<HeatSourceResult> {
  return { points: [], connected: false };
}
