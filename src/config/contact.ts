import { encodeContactValue } from '../utils/contact-obfuscation';

const env = import.meta.env as Record<string, string | undefined>;

function readEnv(name: string, fallback: string): string {
  const value = env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

const DEFAULT_CONTACT_EMAIL = ['nico', 'lecoledubelier.beer'].join('@');

export const CONTACT_EMAIL = readEnv('PUBLIC_CONTACT_EMAIL', DEFAULT_CONTACT_EMAIL);

export const CONTACT_FORM_PROVIDER = readEnv('PUBLIC_CONTACT_FORM_PROVIDER', 'FormSubmit');

export const CONTACT_FORM_ENDPOINT = readEnv(
  'PUBLIC_CONTACT_FORM_ENDPOINT',
  `https://formsubmit.co/${CONTACT_EMAIL}`
);

export const CONTACT_FORM_REDIRECT_URL = readEnv(
  'PUBLIC_CONTACT_FORM_REDIRECT_URL',
  'https://lecoledubelier.beer/#contact'
);

export const CONTACT_FORM_CAPTCHA_ENABLED =
  readEnv('PUBLIC_CONTACT_FORM_CAPTCHA', 'true').toLowerCase() !== 'false';

export const CONTACT_FORM_ENDPOINT_TOKEN = encodeContactValue(CONTACT_FORM_ENDPOINT);
