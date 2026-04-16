import { nanoid } from '../utils/nanoid';

describe('nanoid', () => {
  it('returns a string', () => {
    expect(typeof nanoid()).toBe('string');
  });

  it('returns a non-empty string', () => {
    expect(nanoid().length).toBeGreaterThan(0);
  });

  it('returns unique values on each call', () => {
    const ids = Array.from({ length: 20 }, () => nanoid());
    const unique = new Set(ids);
    expect(unique.size).toBe(20);
  });
});
