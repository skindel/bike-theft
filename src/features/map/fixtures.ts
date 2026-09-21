import type { DemoZone, ParkingLocation } from '@/contracts';
// Illustrative polygons and counts, NOT administrative boundaries or observed thefts.
export const zones: DemoZone[] = [
  {
    id: 'centrum',
    name: 'Centrum',
    count: 32,
    coordinates: [
      [5.681, 50.845],
      [5.693, 50.845],
      [5.696, 50.857],
      [5.684, 50.858],
      [5.681, 50.845],
    ],
  },
  {
    id: 'wyck',
    name: 'Wyck',
    count: 17,
    coordinates: [
      [5.696, 50.845],
      [5.707, 50.845],
      [5.71, 50.853],
      [5.698, 50.857],
      [5.696, 50.845],
    ],
  },
  {
    id: 'jeker',
    name: 'Jekerkwartier',
    count: 6,
    coordinates: [
      [5.681, 50.836],
      [5.694, 50.836],
      [5.693, 50.844],
      [5.681, 50.845],
      [5.681, 50.836],
    ],
  },
];
export const parking: ParkingLocation[] = [
  {
    id: 'markt',
    name: 'Markt bicycle parking',
    area: 'Centrum',
    coordinates: [5.691, 50.8518],
    covered: true,
    guarded: true,
    note: 'Illustrative pin and attributes. Check municipal information for access and opening hours.',
  },
  {
    id: 'station',
    name: 'Station bicycle parking',
    area: 'Wyck',
    coordinates: [5.7058, 50.8495],
    covered: true,
    guarded: true,
    note: 'Illustrative pin and attributes. Check the operator for current fees and opening hours.',
  },
  {
    id: 'kesselskade',
    name: 'Kesselskade bicycle parking',
    area: 'Centrum',
    coordinates: [5.6947, 50.85],
    covered: false,
    guarded: true,
    note: 'Illustrative pin and attributes. Supervision and access may depend on opening hours.',
  },
];
