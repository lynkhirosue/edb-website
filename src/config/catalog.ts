/**
 * Configuration du catalogue public cross-plateforme.
 *
 * L'URL est résolue dans cet ordre :
 *  1. Variable d'environnement PUBLIC_CATALOG_URL (prioritaire, pratique pour preview/staging)
 *  2. URL CDN de production par défaut
 */
export const CATALOG_URL: string =
  import.meta.env.PUBLIC_CATALOG_URL ??
  'https://brewery-catalog.the-school-of-the-ram.workers.dev/api/public-catalog.json';
