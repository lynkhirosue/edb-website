import { safeAddEventListener, safeQuerySelector, safeQuerySelectorAll } from '../utils/dom-helpers';
import type { Beer } from '../schemas/beer.schema';
import { recommendBeer, type QuizAnswers } from '../utils/quiz-engine';

const FALLBACK_BEER_IMAGE = '/beers/placeholder-beer.svg';

type BeerForUi = Beer & {
  detailImage?: string;
};

type AnalyticsWindow = Window & {
  edbAnalytics?: {
    trackEvent: (name: string, label?: string) => number;
  };
};

function track(name: string, label?: string): void {
  (window as AnalyticsWindow).edbAnalytics?.trackEvent(name, label);
}

function parseBeers(): BeerForUi[] {
  const payload = safeQuerySelector<HTMLScriptElement>('#beers-data');

  if (!payload?.textContent) {
    return [];
  }

  try {
    return JSON.parse(payload.textContent) as BeerForUi[];
  } catch (error) {
    console.error('Impossible de parser les données bières:', error);
    return [];
  }
}

function syncBodyScrollLock(): void {
  const hasOpenModal = Boolean(document.querySelector('.beer-modal.is-open, .quiz-modal.is-open'));
  document.body.style.overflow = hasOpenModal ? 'hidden' : '';
}

function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') {
    return;
  }

  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function getAvailabilityLabel(status: Beer['availability']): string {
  const labels: Record<Beer['availability'], string> = {
    available: 'En stock',
    coming_soon: 'Arrive bientôt',
    sold_out: 'Rupture de stock'
  };

  return labels[status];
}

function initBeerModal(beers: BeerForUi[]): void {
  const modal = safeQuerySelector<HTMLElement>('#beer-modal');
  const modalOverlay = safeQuerySelector<HTMLElement>('#beer-modal-overlay');
  const closeButton = safeQuerySelector<HTMLButtonElement>('#beer-modal-close');
  const openButtons = safeQuerySelectorAll<HTMLButtonElement>('.js-open-beer-details');

  const title = safeQuerySelector<HTMLElement>('#beer-modal-title');
  const type = safeQuerySelector<HTMLElement>('#beer-modal-type');
  const description = safeQuerySelector<HTMLElement>('#beer-modal-description');
  const availability = safeQuerySelector<HTMLElement>('#beer-modal-availability');
  const image = safeQuerySelector<HTMLImageElement>('#beer-modal-image');
  const visual = safeQuerySelector<HTMLElement>('#beer-modal .beer-modal-visual');
  const profile = safeQuerySelector<HTMLElement>('#beer-modal-profile');
  const pairings = safeQuerySelector<HTMLElement>('#beer-modal-pairings');

  if (!modal || !modalOverlay || !title || !type || !description || !availability || !image || !profile || !pairings || !visual) {
    return;
  }

  const modalEl = modal;
  const modalOverlayEl = modalOverlay;
  const titleEl = title;
  const typeEl = type;
  const descriptionEl = description;
  const availabilityEl = availability;
  const imageEl = image;
  const visualEl = visual;
  const profileEl = profile;
  const pairingsEl = pairings;
  let previousFocus: HTMLElement | null = null;

  function setModalState(open: boolean): void {
    modalEl.classList.toggle('is-open', open);
    modalOverlayEl.classList.toggle('is-open', open);
    modalEl.hidden = !open;
    modalOverlayEl.hidden = !open;
    modalEl.setAttribute('aria-hidden', String(!open));
    modalOverlayEl.setAttribute('aria-hidden', String(!open));
  }

  function setModalImage(source: string | undefined, alt: string): void {
    const normalizedSource = source?.trim() ?? '';
    imageEl.dataset.fallbackApplied = 'false';

    if (!normalizedSource) {
      imageEl.src = FALLBACK_BEER_IMAGE;
      imageEl.alt = alt;
      visualEl.classList.remove('is-empty');
      return;
    }

    visualEl.classList.remove('is-empty');
    imageEl.src = normalizedSource;
    imageEl.alt = alt;
  }

  function openModal(beerId: string): void {
    const beer = beers.find((item) => item.id === beerId);

    if (!beer) {
      return;
    }

    previousFocus = document.activeElement as HTMLElement;
    titleEl.textContent = beer.name;
    typeEl.textContent = beer.type;
    descriptionEl.textContent = beer.description;
    availabilityEl.textContent = getAvailabilityLabel(beer.availability);
    availabilityEl.dataset.status = beer.availability;
    setModalImage(beer.detailImage ?? beer.image, `${beer.name} - ${beer.type}`);

    profileEl.innerHTML = beer.flavorProfile.map((item) => `<li>${item}</li>`).join('');
    pairingsEl.innerHTML = beer.pairings.map((item) => `<li>${item}</li>`).join('');

    setModalState(true);
    syncBodyScrollLock();

    closeButton?.focus();
    track('beer_detail_open', beer.id);
  }

  function closeModal(): void {
    setModalState(false);
    syncBodyScrollLock();

    previousFocus?.focus();
  }

  openButtons.forEach((button) => {
    safeAddEventListener(button, 'click', () => {
      const beerId = button.dataset.beerId;
      if (beerId) {
        openModal(beerId);
      }
    });
  });

  safeAddEventListener(closeButton, 'click', closeModal);
  safeAddEventListener(modalOverlay, 'click', closeModal);
  safeAddEventListener(closeButton, 'touchend', closeModal);
  safeAddEventListener(modalOverlay, 'touchend', closeModal);
  safeAddEventListener(imageEl, 'error', () => {
    if (imageEl.dataset.fallbackApplied === 'true') {
      visualEl.classList.add('is-empty');
      return;
    }

    imageEl.dataset.fallbackApplied = 'true';
    imageEl.src = FALLBACK_BEER_IMAGE;
    imageEl.alt = 'Illustration temporaire de la bière';
    visualEl.classList.remove('is-empty');
  });
  safeAddEventListener(imageEl, 'load', () => {
    visualEl.classList.remove('is-empty');
  });

  document.addEventListener('keydown', (event) => {
    if (modalEl.classList.contains('is-open') && event.key === 'Escape') {
      closeModal();
      return;
    }

    if (modalEl.classList.contains('is-open')) {
      trapFocus(modalEl, event);
    }
  });

  document.addEventListener('beer:open-detail', (event) => {
    const customEvent = event as CustomEvent<{ beerId: string }>;
    const beerId = customEvent.detail?.beerId;

    if (beerId) {
      openModal(beerId);
    }
  });

  closeModal();
}

function initQuiz(beers: BeerForUi[]): void {
  const openButton = safeQuerySelector<HTMLButtonElement>('#quiz-open-btn');
  const closeButton = safeQuerySelector<HTMLButtonElement>('#quiz-close-btn');
  const modal = safeQuerySelector<HTMLElement>('#quiz-modal');
  const overlay = safeQuerySelector<HTMLElement>('#quiz-modal-overlay');

  const form = safeQuerySelector<HTMLFormElement>('#beer-quiz-form');
  const result = safeQuerySelector<HTMLElement>('#quiz-result');
  const resultTitle = safeQuerySelector<HTMLElement>('#quiz-result-title');
  const resultReason = safeQuerySelector<HTMLElement>('#quiz-result-reasons');
  const resultButton = safeQuerySelector<HTMLButtonElement>('#quiz-result-button');

  if (!openButton || !closeButton || !modal || !overlay || !form || !result || !resultTitle || !resultReason || !resultButton) {
    return;
  }

  const openButtonEl = openButton;
  const closeButtonEl = closeButton;
  const modalEl = modal;
  const overlayEl = overlay;
  let previousFocus: HTMLElement | null = null;

  function setQuizState(open: boolean): void {
    modalEl.classList.toggle('is-open', open);
    overlayEl.classList.toggle('is-open', open);
    modalEl.hidden = !open;
    overlayEl.hidden = !open;
    modalEl.setAttribute('aria-hidden', String(!open));
    overlayEl.setAttribute('aria-hidden', String(!open));
  }

  function openQuiz(): void {
    previousFocus = document.activeElement as HTMLElement;
    setQuizState(true);
    syncBodyScrollLock();

    closeButtonEl.focus();
    track('quiz_open');
  }

  function closeQuiz(): void {
    setQuizState(false);
    syncBodyScrollLock();

    previousFocus?.focus();
  }

  function openRecommendedBeer(beerId: string): void {
    closeQuiz();

    requestAnimationFrame(() => {
      document.dispatchEvent(
        new CustomEvent('beer:open-detail', {
          detail: { beerId }
        })
      );
    });
  }

  safeAddEventListener(openButtonEl, 'click', openQuiz);
  safeAddEventListener(closeButtonEl, 'click', closeQuiz);
  safeAddEventListener(overlayEl, 'click', closeQuiz);
  safeAddEventListener(closeButtonEl, 'touchend', closeQuiz);
  safeAddEventListener(overlayEl, 'touchend', closeQuiz);

  safeAddEventListener(form, 'submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const answers = {
      intensity: formData.get('intensity'),
      aroma: formData.get('aroma'),
      occasion: formData.get('occasion'),
      finish: formData.get('finish'),
      adventure: formData.get('adventure')
    };

    const missingAnswer = Object.values(answers).some((value) => typeof value !== 'string' || !value);

    if (missingAnswer) {
      result.hidden = false;
      resultTitle.textContent = 'Il manque une réponse pour terminer le quiz.';
      resultReason.innerHTML = '<li>Complète les 5 questions pour obtenir une recommandation.</li>';
      resultButton.hidden = true;
      return;
    }

    const recommendation = recommendBeer(beers, answers as QuizAnswers);

    result.hidden = false;
    resultTitle.textContent = `${recommendation.beer.name} semble faite pour toi.`;
    resultReason.innerHTML = recommendation.reasons.map((reason) => `<li>${reason}</li>`).join('');

    resultButton.hidden = false;
    resultButton.dataset.beerId = recommendation.beer.id;

    track('quiz_completed', recommendation.beer.id);
  });

  safeAddEventListener(resultButton, 'click', () => {
    const beerId = resultButton.dataset.beerId;

    if (beerId) {
      openRecommendedBeer(beerId);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (modalEl.classList.contains('is-open') && event.key === 'Escape') {
      closeQuiz();
      return;
    }

    if (modalEl.classList.contains('is-open')) {
      trapFocus(modalEl, event);
    }
  });

  closeQuiz();
}

function initBeersPage(): void {
  const beers = parseBeers();

  if (!beers.length) {
    return;
  }

  initBeerModal(beers);
  initQuiz(beers);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBeersPage);
} else {
  initBeersPage();
}
