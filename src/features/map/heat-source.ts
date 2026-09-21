import type { TheftHeatPoint } from './theft-heatmap';
export type HeatSourceResult = { points: TheftHeatPoint[]; connected: boolean };
/**
 * Supabase is not wired up yet, so there is deliberately no data here: no fixtures,
 * no synthetic incidents. Replace the body with the aggregate query once the schema
 * and the public aggregate endpoint exist, and keep `connected` honest.
 */
export async function loadTheftHeatPoints(): Promise<HeatSourceResult> {
  return { points: [], connected: false };
}
