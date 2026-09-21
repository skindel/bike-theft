import type { TheftHeatPoint } from './theft-heatmap';
export type HeatSourceResult = { points: TheftHeatPoint[]; connected: boolean };
type HeatmapRow = { longitude: number; latitude: number; weight: number };
/**
 * Pulls aggregated, anonymized incident points from the `get_theft_heatmap_points`
 * Supabase RPC, which combines `reported-incidents` (opted-in reports only) and
 * `police-incidents`, binned onto a coarse grid. No raw rows or personal details
 * ever leave the database — see supabase/migrations/202609210002_theft_heatmap_points.sql.
 */
export async function loadTheftHeatPoints(): Promise<HeatSourceResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return { points: [], connected: false };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_theft_heatmap_points`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) return { points: [], connected: false };

    const rows = (await response.json()) as HeatmapRow[];
    return {
      points: rows.map((row) => ({
        coordinates: [row.longitude, row.latitude],
        weight: row.weight,
      })),
      connected: true,
    };
  } catch {
    return { points: [], connected: false };
  }
}
