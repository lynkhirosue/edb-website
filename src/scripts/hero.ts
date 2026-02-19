import { safeAddEventListener, safeQuerySelector } from '../utils/dom-helpers';

function initHero(): void {
  const heroSection = safeQuerySelector<HTMLElement>('.hero-section');
  const heroImage = safeQuerySelector<HTMLElement>('.hero-image');
  const heroContent = safeQuerySelector<HTMLElement>('.hero-content');
  const scrollIndicator = safeQuerySelector<HTMLElement>('.scroll-indicator');

  if (!heroSection || !heroImage || !heroContent) {
    return;
  }

  const heroSectionEl = heroSection;
  const heroImageEl = heroImage;
  const heroContentEl = heroContent;
  let ticking = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateParallax(): void {
    const scrolled = window.scrollY;
    const heroHeight = heroSectionEl.offsetHeight;

    if (!reducedMotion && scrolled <= heroHeight) {
      const translateY = scrolled * 0.35;
      heroImageEl.style.transform = `translate3d(0, ${translateY}px, 0)`;

      const opacity = Math.max(0, 1 - scrolled / (heroHeight * 0.6));
      heroContentEl.style.opacity = String(opacity);
      heroContentEl.style.transform = `translateY(${scrolled * 0.12}px)`;

      if (scrollIndicator) {
        scrollIndicator.style.opacity = String(Math.max(0, 1 - scrolled / 200));
      }
    }

    ticking = false;
  }

  function requestUpdate(): void {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  safeAddEventListener(scrollIndicator, 'click', () => {
    const targetId = scrollIndicator?.getAttribute('data-target') ?? '#home-journey';
    const target = safeQuerySelector<HTMLElement>(targetId);

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  if (!reducedMotion) {
    setTimeout(() => {
      safeQuerySelector<HTMLElement>('.hero-title')?.classList.add('animate-in');
      setTimeout(() => safeQuerySelector<HTMLElement>('.hero-subtitle')?.classList.add('animate-in'), 170);
      setTimeout(() => safeQuerySelector<HTMLElement>('.hero-actions')?.classList.add('animate-in'), 340);
      setTimeout(() => safeQuerySelector<HTMLElement>('.scroll-indicator')?.classList.add('animate-in'), 520);
    }, 180);
  }

  updateParallax();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero);
} else {
  initHero();
}
