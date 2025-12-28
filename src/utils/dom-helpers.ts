/**
 * Utilitaires pour manipuler le DOM de manière sûre avec gestion d'erreurs
 */

/**
 * Sélectionne un élément du DOM de manière sûre
 * @param selector Sélecteur CSS
 * @param context Contexte de recherche (défaut: document)
 * @returns L'élément trouvé ou null
 */
export function safeQuerySelector<T extends HTMLElement>(
  selector: string,
  context: Document | HTMLElement = document
): T | null {
  try {
    return context.querySelector<T>(selector);
  } catch (error) {
    console.error(`Erreur lors de la sélection de "${selector}":`, error);
    return null;
  }
}

/**
 * Sélectionne tous les éléments correspondants de manière sûre
 * @param selector Sélecteur CSS
 * @param context Contexte de recherche (défaut: document)
 * @returns NodeList des éléments trouvés
 */
export function safeQuerySelectorAll<T extends HTMLElement>(
  selector: string,
  context: Document | HTMLElement = document
): NodeListOf<T> {
  try {
    return context.querySelectorAll<T>(selector);
  } catch (error) {
    console.error(`Erreur lors de la sélection multiple de "${selector}":`, error);
    return document.querySelectorAll<T>('not-found'); // Retourne une NodeList vide
  }
}

/**
 * Récupère une valeur du localStorage de manière sûre
 * @param key Clé à récupérer
 * @param defaultValue Valeur par défaut si erreur
 * @returns La valeur stockée ou la valeur par défaut
 */
export function safeGetLocalStorage(key: string, defaultValue: string = ''): string {
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch (error) {
    console.error(`Erreur lors de la lecture de localStorage["${key}"]:`, error);
    return defaultValue;
  }
}

/**
 * Stocke une valeur dans le localStorage de manière sûre
 * @param key Clé à stocker
 * @param value Valeur à stocker
 * @returns true si succès, false sinon
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans localStorage["${key}"]:`, error);
    return false;
  }
}

/**
 * Ajoute un event listener avec gestion d'erreur automatique
 * @param element Élément cible
 * @param event Type d'événement
 * @param handler Fonction de callback
 * @param options Options de l'event listener
 */
export function safeAddEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null | undefined,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  if (!element) {
    console.warn(`Impossible d'ajouter l'event listener "${event}": élément non trouvé`);
    return;
  }

  try {
    element.addEventListener(event, handler as EventListener, options);
  } catch (error) {
    console.error(`Erreur lors de l'ajout de l'event listener "${event}":`, error);
  }
}

/**
 * Scroll vers un élément de manière sûre
 * @param selector Sélecteur de l'élément cible
 * @param offset Décalage en pixels (défaut: 0)
 * @param behavior Comportement du scroll (défaut: 'smooth')
 */
export function safeScrollTo(
  selector: string,
  offset: number = 0,
  behavior: ScrollBehavior = 'smooth'
): void {
  try {
    const element = safeQuerySelector(selector);
    if (!element) {
      console.warn(`Élément "${selector}" non trouvé pour le scroll`);
      return;
    }

    const targetPosition = element.offsetTop - offset;
    window.scrollTo({
      top: targetPosition,
      behavior
    });
  } catch (error) {
    console.error(`Erreur lors du scroll vers "${selector}":`, error);
  }
}

/**
 * Détecte si l'utilisateur préfère le mode sombre
 * @returns true si mode sombre préféré, false sinon
 */
export function prefersDarkMode(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
    console.error('Erreur lors de la détection du thème système:', error);
    return false;
  }
}
