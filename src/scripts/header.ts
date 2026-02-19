import {
  prefersDarkMode,
  safeAddEventListener,
  safeGetLocalStorage,
  safeQuerySelector,
  safeQuerySelectorAll,
  safeSetLocalStorage
} from '../utils/dom-helpers';

function initTheme(themeToggle: HTMLElement | null): void {
  const savedTheme = safeGetLocalStorage('theme');
  const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDarkMode());

  document.documentElement.classList.toggle('dark', shouldUseDark);
  themeToggle?.classList.toggle('theme-dark', shouldUseDark);
}

function toggleTheme(themeToggle: HTMLElement | null): void {
  const isDark = document.documentElement.classList.contains('dark');
  const nextDark = !isDark;

  document.documentElement.classList.toggle('dark', nextDark);
  themeToggle?.classList.toggle('theme-dark', nextDark);
  safeSetLocalStorage('theme', nextDark ? 'dark' : 'light');
}

function initHeader(): void {
  const header = safeQuerySelector<HTMLElement>('#header');
  const menuToggle = safeQuerySelector<HTMLElement>('#menu-toggle');
  const mainNav = safeQuerySelector<HTMLElement>('#site-nav');
  const mobileOverlay = safeQuerySelector<HTMLElement>('#mobile-overlay');
  const themeToggle = safeQuerySelector<HTMLElement>('#theme-toggle');
  const navLinks = safeQuerySelectorAll<HTMLAnchorElement>('.nav-link');

  if (!header) {
    return;
  }

  const headerEl = header;
  let isMenuOpen = false;
  let lastScrollY = window.scrollY;

  function setMenuState(open: boolean): void {
    isMenuOpen = open;
    menuToggle?.setAttribute('aria-expanded', String(open));
    headerEl.classList.toggle('menu-open', open);
    mainNav?.classList.toggle('nav-open', open);
    mobileOverlay?.classList.toggle('overlay-visible', open);
    menuToggle?.classList.toggle('menu-active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function onScroll(): void {
    const currentScrollY = window.scrollY;

    headerEl.classList.toggle('scrolled', currentScrollY > 30);

    if (!isMenuOpen && currentScrollY > lastScrollY && currentScrollY > 110) {
      headerEl.classList.add('header-hidden');
    } else {
      headerEl.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
  }

  initTheme(themeToggle);

  safeAddEventListener(menuToggle, 'click', () => setMenuState(!isMenuOpen));
  safeAddEventListener(mobileOverlay, 'click', () => setMenuState(false));
  safeAddEventListener(themeToggle, 'click', () => toggleTheme(themeToggle));

  navLinks.forEach((link) => {
    safeAddEventListener(link, 'click', () => {
      if (isMenuOpen) {
        setMenuState(false);
      }
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && isMenuOpen) {
      setMenuState(false);
    }
  });

  onScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader);
} else {
  initHeader();
}
