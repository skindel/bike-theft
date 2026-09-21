import { describe, expect, it } from 'vitest';
import { activityBand } from './risk';
import { zones, parking } from './fixtures';
describe('activity bands', () => {
  it('distinguishes unknown data from low activity', () => {
    for (const value of [null, -1, NaN, Infinity]) expect(activityBand(value)).toBe('unknown');
    expect(activityBand(0)).toBe('low');
  });
  it('uses documented thresholds', () => {
    expect(activityBand(9)).toBe('low');
    expect(activityBand(10)).toBe('medium');
    expect(activityBand(24)).toBe('medium');
    expect(activityBand(25)).toBe('high');
  });
  it('keeps all fixtures around Maastricht, longitude first, with closed polygons', () => {
    const points = [...parking.map((p) => p.coordinates), ...zones.flatMap((z) => z.coordinates)];
    for (const [lng, lat] of points) {
      expect(lng).toBeGreaterThan(5.6);
      expect(lng).toBeLessThan(5.8);
      expect(lat).toBeGreaterThan(50.7);
      expect(lat).toBeLessThan(51);
    }
    for (const zone of zones) expect(zone.coordinates[0]).toEqual(zone.coordinates.at(-1));
  });
});
