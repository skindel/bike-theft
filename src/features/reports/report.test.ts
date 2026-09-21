import { expect, it } from 'vitest';
import { reportSchema } from '@/contracts';
const report = {
  brand: 'Gazelle',
  color: 'Blue',
  type: 'City bike',
  serial: '',
  location: 'Markt',
  lastSeen: '2025-01-01T10:00',
  discovered: '2025-01-01T11:00',
  details: '',
  shareAggregate: false,
};
it('accepts unknown serial number and no aggregate consent', () => {
  expect(reportSchema.safeParse(report).success).toBe(true);
});
it('rejects impossible time ordering and future dates', () => {
  expect(reportSchema.safeParse({ ...report, discovered: '2025-01-01T09:00' }).success).toBe(false);
  expect(reportSchema.safeParse({ ...report, discovered: '2099-01-01T09:00' }).success).toBe(false);
});
it('rejects blank required fields and invalid dates', () => {
  expect(reportSchema.safeParse({ ...report, brand: '   ' }).success).toBe(false);
  expect(reportSchema.safeParse({ ...report, lastSeen: 'nonsense' }).success).toBe(false);
});
