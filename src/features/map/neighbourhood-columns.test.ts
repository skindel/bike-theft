import { describe, expect, it } from 'vitest';
import { resolveColumns } from './neighbourhood-columns';

describe('neighbourhood column resolution', () => {
  it('reads a spaced count per 1000 column', () => {
    const columns = resolveColumns({
      neighbourhood: 'Binnenstad',
      count: 40,
      'count per 1000': 12.4,
    });
    expect(columns.name).toBe('neighbourhood');
    expect(columns.count).toBe('count');
    expect(columns.rate).toBe('count per 1000');
    expect(columns.denominator).toBe(1000);
  });

  it('reads a snake-case count_per_1000 column', () => {
    const columns = resolveColumns({ neighbourhood: 'Wyck', count_per_1000: 8 });
    expect(columns.rate).toBe('count_per_1000');
    expect(columns.denominator).toBe(1000);
  });
});
