/**
 * Configuration du catalogue public cross-plateforme.
 *
 * Les deux constantes sont résolues dans cet ordre :
 *  1. Variable d'environnement PUBLIC_* (prioritaire, pratique pour preview/staging)
 *  2. URL CDN de production par défaut
 *
 * Les images sont désormais servies depuis le bucket R2 connecté à
 * `assets.lecoledubelier.beer/images/<slug>.webp` pour rester alignés avec
 * ce que BreweryManager (macOS) uploade via POST /api/images/.
 *
 * `LOCAL_BEER_IMAGE_PREFIX` est une compat' pour les rares cas où un composant
 * Astro référence encore un fichier embarqué (`/beers/placeholder-beer.svg`) :
 * il ne s'applique qu'aux chemins déjà préfixés par `/`.
 */
export const CATALOG_URL: string =
  import.meta.env.PUBLIC_CATALOG_URL ??
  'https://brewery-catalog.the-school-of-the-ram.workers.dev/api/public-catalog.json';

export const IMAGE_HOST: string =
  import.meta.env.PUBLIC_IMAGE_HOST ??
  'https://assets.lecoledubelier.beer/images';

const requestedCatalogSource = String(
  import.meta.env.CATALOG_SOURCE ??
  import.meta.env.PUBLIC_CATALOG_SOURCE ??
  'local'
).toLowerCase();

export const CATALOG_SOURCE: 'local' | 'live' =
  requestedCatalogSource === 'live' ? 'live' : 'local';

export const SHOULD_FETCH_LIVE_CATALOG = CATALOG_SOURCE === 'live';

export function isAllowedLocalBeerImagePath(imagePath: string): boolean {
  return (
    /^\/(?:beers|assets)\/[A-Za-z0-9._/-]+$/.test(imagePath) &&
    !imagePath.includes('..') &&
    !imagePath.includes('//')
  );
}

export function isAllowedBeerImageURL(imageUrl: string, imageHost: string = IMAGE_HOST): boolean {
  try {
    const url = new URL(imageUrl);
    const host = new URL(imageHost);
    const hostPath = host.pathname.replace(/\/$/, '');

    return (
      url.protocol === 'https:' &&
      url.origin === host.origin &&
      (hostPath === '' || url.pathname === hostPath || url.pathname.startsWith(`${hostPath}/`))
    );
  } catch {
    return false;
  }
}

/**
 * Résout une référence d'image du catalogue public (ex. `imperial-stout.webp`)
 * en URL absolue, en acceptant aussi les chemins locaux historiques
 * (ex. `/beers/placeholder-beer.svg`) sans les casser.
 */
export function resolveBeerImageURL(
  imageRef: string | null | undefined,
  fallback: string
): string {
  if (!imageRef || imageRef.trim() === '') return fallback;

  if (/^https?:\/\//i.test(imageRef)) {
    return isAllowedBeerImageURL(imageRef) ? imageRef : fallback;
  }

  if (imageRef.startsWith('/')) {
    return isAllowedLocalBeerImagePath(imageRef) ? imageRef : fallback;
  }

  // Sinon on considère qu'il s'agit d'un nom de fichier `slug.ext`.
  const host = IMAGE_HOST.replace(/\/$/, '');
  return `${host}/${imageRef}`;
}
