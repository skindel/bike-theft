import type { NeighbourhoodData } from './neighbourhoods';
export type NeighbourhoodState =
  | { status: 'loading' }
  | { status: 'ready'; data: NeighbourhoodData }
  | { status: 'error'; message: string };
export async function loadNeighbourhoods(signal?: AbortSignal): Promise<NeighbourhoodData> {
  const response = await fetch('/api/map/neighbourhoods', { signal });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message ?? 'Could not load neighbourhoods.');
  }
  return {
    features: body.features,
    max: body.max,
    matched: body.matched,
    connected: body.connected,
    period: '2024',
  };
}
