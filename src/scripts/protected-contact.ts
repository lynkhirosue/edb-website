import { decodeContactValue } from '../utils/contact-obfuscation';

function initProtectedContact(): void {
  const token = document.querySelector<HTMLMetaElement>(
    'meta[name="contact-email-token"]'
  )?.content;
  const email = token ? decodeContactValue(token) : null;

  if (!email || !email.includes('@')) {
    return;
  }

  document.querySelectorAll<HTMLElement>('[data-contact-email]').forEach((element) => {
    element.textContent = email;

    if (element instanceof HTMLAnchorElement) {
      element.href = `mailto:${email}`;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProtectedContact);
} else {
  initProtectedContact();
}
