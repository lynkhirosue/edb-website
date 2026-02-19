import { safeQuerySelectorAll } from '../utils/dom-helpers';

function initScrollReveal(): void {
  const revealTargets = safeQuerySelectorAll<HTMLElement>('.reveal');

  if (!revealTargets.length || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
  initScrollReveal();
}
