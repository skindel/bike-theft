import type { ActivityBand } from '@/contracts';
export function activityBand(count: number | null): ActivityBand {
  if (count === null || !Number.isFinite(count) || count < 0) return 'unknown';
  return count >= 25 ? 'high' : count >= 10 ? 'medium' : 'low';
}
export const bandLabels = {
  low: 'Lower activity',
  medium: 'Moderate activity',
  high: 'Higher activity',
  unknown: 'No data',
};
