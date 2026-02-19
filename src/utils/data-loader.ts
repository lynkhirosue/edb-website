import { BeersArraySchema, type Beer } from '../schemas/beer.schema';
import { EquipmentArraySchema, type Equipment } from '../schemas/equipment.schema';
import { BrewingStepsArraySchema, type BrewingStep } from '../schemas/process.schema';
import { EventsArraySchema, type Event } from '../schemas/event.schema';
import { ReleasesArraySchema, type Release } from '../schemas/release.schema';
import { PublicCatalogSchema, type PublicCatalog } from '../schemas/catalog.schema';
import { CATALOG_URL } from '../config/catalog';
import { mapCatalogBeerToLocalBeer, mapCatalogToReleases } from './catalog-mapper';

// ─────────────────────────────────────────────
// Cache en mémoire pour éviter les fetches multiples
// pendant un même build Astro
// ─────────────────────────────────────────────

let cachedCatalog: PublicCatalog | null = null;

/**
 * Tente de charger et valider le catalogue distant.
 * Retourne null si le fetch ou la validation échoue.
 */
async function fetchCatalog(): Promise<PublicCatalog | null> {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  try {
    // Build cache-busting: évite de rebuilder le site avec une version CDN obsolète.
    const requestUrl = new URL(CATALOG_URL);
    requestUrl.searchParams.set('_build', String(Date.now()));

    const response = await fetch(requestUrl.toString(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
    });

    if (!response.ok) {
      console.warn(`Catalogue distant : HTTP ${response.status}`);
      return null;
    }

    let raw: unknown;
    try {
      raw = await response.json();
    } catch (parseError) {
      const contentType = response.headers.get('content-type');
      console.warn(`Catalogue distant : réponse invalide (${contentType})`);
      return null;
    }

    const parsed = PublicCatalogSchema.safeParse(raw);

    if (!parsed.success) {
      console.warn('Catalogue distant : validation Zod échouée', parsed.error.format());
      return null;
    }

    cachedCatalog = parsed.data;
    console.info(
      `Catalogue distant chargé : ${parsed.data.beers.length} bière(s), ` +
      `généré le ${parsed.data.generatedAt}`
    );
    return cachedCatalog;
  } catch (error) {
    console.warn('Catalogue distant indisponible, fallback local :', error);
    return null;
  }
}

// ─────────────────────────────────────────────
// Loaders publics
// ─────────────────────────────────────────────

/**
 * Charge les bières depuis le catalogue distant.
 * Fallback transparent sur beers.json local si le catalogue est indisponible.
 *
 * @returns Tableau de bières validées (format local Beer)
 * @throws Error si le fallback local échoue aussi
 */
export async function loadBeers(): Promise<Beer[]> {
  // 1. Tenter le catalogue distant
  const catalog = await fetchCatalog();

  if (catalog && catalog.beers.length > 0) {
    return catalog.beers.map(mapCatalogBeerToLocalBeer);
  }

  // 2. Fallback : données locales
  console.info('Utilisation des données locales (beers.json)');
  return loadBeersLocal();
}

/**
 * Charge les bières depuis le fichier JSON local uniquement.
 * Utile pour les tests et comme fallback interne.
 */
export async function loadBeersLocal(): Promise<Beer[]> {
  try {
    const beersData = await import('../data/beers.json');
    const parsed = BeersArraySchema.safeParse(beersData.default);

    if (!parsed.success) {
      console.error('Erreur de validation des bières:', parsed.error.format());
      throw new Error('Données de bières invalides');
    }

    return parsed.data;
  } catch (error) {
    console.error('Erreur lors du chargement des bières:', error);
    throw error;
  }
}

/**
 * Charge les sorties (releases) depuis le catalogue distant.
 * Fallback transparent sur releases.json local.
 */
export async function loadReleases(): Promise<Release[]> {
  // 1. Tenter le catalogue distant
  const catalog = await fetchCatalog();

  if (catalog) {
    const releases = mapCatalogToReleases(catalog);

    if (releases.length > 0) {
      return releases;
    }
  }

  // 2. Fallback : données locales
  console.info('Utilisation des données locales (releases.json)');
  return loadReleasesLocal();
}

/**
 * Charge les releases depuis le fichier JSON local uniquement.
 */
export async function loadReleasesLocal(): Promise<Release[]> {
  try {
    const releasesData = await import('../data/releases.json');
    const parsed = ReleasesArraySchema.safeParse(releasesData.default);

    if (!parsed.success) {
      console.error('Erreur de validation des sorties:', parsed.error.format());
      throw new Error('Données de sorties invalides');
    }

    return parsed.data;
  } catch (error) {
    console.error('Erreur lors du chargement des sorties:', error);
    throw error;
  }
}

/**
 * Retourne le catalogue brut (distant) s'il est disponible.
 * Utile pour les composants qui ont besoin des données enrichies
 * (stock niveaux, fermentation détaillée, etc.).
 */
export async function loadCatalog(): Promise<PublicCatalog | null> {
  return fetchCatalog();
}

/**
 * Charge et valide les données des équipements depuis le fichier JSON
 * @returns Tableau d'équipements validés
 * @throws Error si la validation échoue
 */
export async function loadEquipment(): Promise<Equipment[]> {
  try {
    const equipmentData = await import('../data/equipment.json');
    const parsed = EquipmentArraySchema.safeParse(equipmentData.default);

    if (!parsed.success) {
      console.error('Erreur de validation des équipements:', parsed.error.format());
      throw new Error('Données d\'équipements invalides');
    }

    return parsed.data;
  } catch (error) {
    console.error('Erreur lors du chargement des équipements:', error);
    throw error;
  }
}

/**
 * Charge et valide les données du processus de brassage depuis le fichier JSON
 * @returns Tableau d'étapes de brassage validées
 * @throws Error si la validation échoue
 */
export async function loadBrewingSteps(): Promise<BrewingStep[]> {
  try {
    const processData = await import('../data/process.json');
    const parsed = BrewingStepsArraySchema.safeParse(processData.default);

    if (!parsed.success) {
      console.error('Erreur de validation du processus:', parsed.error.format());
      throw new Error('Données du processus invalides');
    }

    return parsed.data;
  } catch (error) {
    console.error('Erreur lors du chargement du processus:', error);
    throw error;
  }
}

/**
 * Charge et valide les données des événements
 * @returns Tableau d'événements validés
 */
export async function loadEvents(): Promise<Event[]> {
  try {
    const eventsData = await import('../data/events.json');
    const parsed = EventsArraySchema.safeParse(eventsData.default);

    if (!parsed.success) {
      console.error('Erreur de validation des événements:', parsed.error.format());
      throw new Error('Données d\'événements invalides');
    }

    return parsed.data;
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error);
    throw error;
  }
}
