import { describe, it, expect } from 'vitest';
import { detectEcosystems, parseDependencies } from '../scanner';
import { join } from 'path';

describe('detectEcosystems', () => {
  it('returns empty array for directory with no lockfiles', () => {
    const result = detectEcosystems('C:\\nonexistent');
    expect(result).toEqual([]);
  });
});

describe('parseDependencies', () => {
  it('returns empty array for nonexistent path', () => {
    const result = parseDependencies('C:\\nonexistent');
    expect(result).toEqual([]);
  });
});
