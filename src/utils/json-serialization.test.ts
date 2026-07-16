import { describe, expect, it } from 'vitest';
import { safeJsonStringify } from './json-serialization';

describe('safeJsonStringify', () => {
  it('échappe les caractères capables de casser une balise script', () => {
    const result = safeJsonStringify({
      name: '</script><script>alert(1)</script>',
      extra: '&\u2028\u2029'
    });

    expect(result).not.toContain('</script>');
    expect(result).toContain('\\u003c/script\\u003e');
    expect(result).toContain('\\u0026');
    expect(result).toContain('\\u2028');
    expect(result).toContain('\\u2029');
  });
});
