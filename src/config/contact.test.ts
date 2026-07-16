import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeContactValue } from '../utils/contact-obfuscation';

async function loadContactConfig() {
  vi.resetModules();
  return import('./contact');
}

describe('contact config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses FormSubmit defaults', async () => {
    const config = await loadContactConfig();
    const expectedEmail = ['nico', 'lecoledubelier.beer'].join('@');

    expect(config.CONTACT_EMAIL).toBe(expectedEmail);
    expect(config.CONTACT_FORM_PROVIDER).toBe('FormSubmit');
    expect(config.CONTACT_FORM_ENDPOINT).toBe(`https://formsubmit.co/${expectedEmail}`);
    expect(config.CONTACT_FORM_REDIRECT_URL).toBe('https://lecoledubelier.beer/#contact');
    expect(config.CONTACT_FORM_CAPTCHA_ENABLED).toBe(true);
    expect(decodeContactValue(config.CONTACT_EMAIL_TOKEN)).toBe(expectedEmail);
    expect(decodeContactValue(config.CONTACT_FORM_ENDPOINT_TOKEN)).toBe(
      `https://formsubmit.co/${expectedEmail}`
    );
  });

  it('derives the default endpoint from a configured email', async () => {
    vi.stubEnv('PUBLIC_CONTACT_EMAIL', 'alerts@example.com');

    const config = await loadContactConfig();

    expect(config.CONTACT_FORM_ENDPOINT).toBe('https://formsubmit.co/alerts@example.com');
  });

  it('accepts a custom provider endpoint and captcha setting', async () => {
    vi.stubEnv('PUBLIC_CONTACT_FORM_PROVIDER', 'Web3Forms');
    vi.stubEnv('PUBLIC_CONTACT_FORM_ENDPOINT', 'https://api.web3forms.com/submit');
    vi.stubEnv('PUBLIC_CONTACT_FORM_REDIRECT_URL', 'https://example.com/merci');
    vi.stubEnv('PUBLIC_CONTACT_FORM_CAPTCHA', 'false');

    const config = await loadContactConfig();

    expect(config.CONTACT_FORM_PROVIDER).toBe('Web3Forms');
    expect(config.CONTACT_FORM_ENDPOINT).toBe('https://api.web3forms.com/submit');
    expect(config.CONTACT_FORM_REDIRECT_URL).toBe('https://example.com/merci');
    expect(config.CONTACT_FORM_CAPTCHA_ENABLED).toBe(false);
  });
});
