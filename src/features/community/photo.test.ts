import { describe, expect, it } from 'vitest';
import { checkPhoto, photoMaxBytes } from './photo';
describe('checkPhoto', () => {
  it('accepts the supported image types', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp'])
      expect(checkPhoto({ type, size: 2048 })).toBeNull();
  });
  it('rejects unsupported types, including ones that only look like images', () => {
    expect(checkPhoto({ type: 'image/svg+xml', size: 2048 })).toMatch(/JPEG/);
    expect(checkPhoto({ type: 'application/pdf', size: 2048 })).toMatch(/JPEG/);
  });
  it('rejects an empty file before looking at its type', () => {
    expect(checkPhoto({ type: 'image/png', size: 0 })).toMatch(/empty/);
  });
  it('accepts a file at the limit and rejects one above it', () => {
    expect(checkPhoto({ type: 'image/png', size: photoMaxBytes })).toBeNull();
    expect(checkPhoto({ type: 'image/png', size: photoMaxBytes + 1 })).toMatch(/4 MB/);
  });
});
