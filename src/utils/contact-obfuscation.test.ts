import { describe, expect, it } from 'vitest';
import { decodeContactValue, encodeContactValue } from './contact-obfuscation';

describe('contact obfuscation', () => {
  it('round-trips an email without exposing its separators', () => {
    const email = ['nico', 'lecoledubelier.beer'].join('@');
    const token = encodeContactValue(email);

    expect(token).not.toContain('@');
    expect(token).not.toContain('lecoledubelier');
    expect(decodeContactValue(token)).toBe(email);
  });

  it('rejects malformed tokens', () => {
    expect(decodeContactValue('not-hex')).toBeNull();
    expect(decodeContactValue('abc')).toBeNull();
    expect(decodeContactValue('')).toBeNull();
  });
});
