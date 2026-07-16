import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encodeContactValue } from '../utils/contact-obfuscation';

describe('contact script', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
  });

  it('restores the HTTPS form endpoint', async () => {
    const endpoint = 'https://formsubmit.co/private-endpoint';
    document.body.innerHTML = `
      <form
        id="alert-form"
        action="/#contact"
        data-provider="FormSubmit"
        data-endpoint-token="${encodeContactValue(endpoint)}"
      >
        <button type="submit" class="alert-submit" disabled>Envoyer</button>
      </form>
    `;

    await import('./contact');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const form = document.querySelector<HTMLFormElement>('#alert-form');
    const button = document.querySelector<HTMLButtonElement>('.alert-submit');
    expect(form?.action).toBe(endpoint);
    expect(button?.disabled).toBe(false);
  });

  it('keeps malformed endpoints disabled', async () => {
    document.body.innerHTML = `
      <form id="alert-form" action="/#contact" data-endpoint-token="invalid">
        <button type="submit" class="alert-submit" disabled>Envoyer</button>
      </form>
    `;

    await import('./contact');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const button = document.querySelector<HTMLButtonElement>('.alert-submit');
    expect(button?.disabled).toBe(true);
  });
});
