import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  safeQuerySelector,
  safeQuerySelectorAll,
  safeGetLocalStorage,
  safeSetLocalStorage,
  prefersDarkMode
} from './dom-helpers';

describe('DOM Helpers', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="test-element">Test</div>
      <div class="test-class">Item 1</div>
      <div class="test-class">Item 2</div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('safeQuerySelector', () => {
    it('should find existing element', () => {
      const element = safeQuerySelector('#test-element');
      expect(element).not.toBeNull();
      expect(element?.textContent).toBe('Test');
    });

    it('should return null for non-existing element', () => {
      const element = safeQuerySelector('#non-existing');
      expect(element).toBeNull();
    });

    it('should handle invalid selector gracefully', () => {
      const element = safeQuerySelector(':::invalid');
      expect(element).toBeNull();
    });
  });

  describe('safeQuerySelectorAll', () => {
    it('should find all matching elements', () => {
      const elements = safeQuerySelectorAll('.test-class');
      expect(elements.length).toBe(2);
    });

    it('should return empty NodeList for non-existing elements', () => {
      const elements = safeQuerySelectorAll('.non-existing');
      expect(elements.length).toBe(0);
    });

    it('should handle invalid selector gracefully', () => {
      const elements = safeQuerySelectorAll(':::invalid');
      expect(elements.length).toBe(0);
    });
  });

  describe('safeGetLocalStorage', () => {
    it('should retrieve existing value from localStorage', () => {
      localStorage.setItem('test-key', 'test-value');
      const value = safeGetLocalStorage('test-key');
      expect(value).toBe('test-value');
    });

    it('should return default value for non-existing key', () => {
      const value = safeGetLocalStorage('non-existing', 'default');
      expect(value).toBe('default');
    });

    it('should return empty string if no default provided', () => {
      const value = safeGetLocalStorage('non-existing');
      expect(value).toBe('');
    });
  });

  describe('safeSetLocalStorage', () => {
    it('should store value in localStorage', () => {
      const success = safeSetLocalStorage('test-key', 'test-value');
      expect(success).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('should return true on successful storage', () => {
      const success = safeSetLocalStorage('key', 'value');
      expect(success).toBe(true);
    });
  });

  describe('prefersDarkMode', () => {
    it('should return boolean', () => {
      const result = prefersDarkMode();
      expect(typeof result).toBe('boolean');
    });

    it('should detect dark mode preference', () => {
      // Mock matchMedia
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const result = prefersDarkMode();
      expect(result).toBe(true);
    });
  });
});
