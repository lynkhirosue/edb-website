import type { Beer } from '../schemas/beer.schema';
import type { Release } from '../schemas/release.schema';
import type { PublicBeer, PublicCatalog } from '../schemas/catalog.schema';

export const DEFAULT_BEER_IMAGE_PATH = '/beers/placeholder-beer.svg';

// ─────────────────────────────────────────────
// Mapping catalogue public → types locaux existants
// Assure la rétrocompatibilité avec les composants Astro
// ─────────────────────────────────────────────

/**
 * Table de correspondance tags français → identifiants flavorProfile
 * utilisés par le quiz engine (quiz-engine.ts).
 */
const TAG_TO_FLAVOR: Record<string, string> = {
  houblonnée: 'hoppy',
  fruitée: 'fruit-forward',
  maltée: 'malty',
  épicée: 'spicy',
  torréfiée: 'roasty',
  légère: 'light-body',
  sèche: 'dry-finish',
  ambrée: 'caramel',
  florale: 'floral',
  nectarine: 'fruit-forward',
  cacao: 'roasty',
  levure: 'rustic',
  lager: 'crisp',
  céréale: 'grainy'
};

/**
 * Déduit un flavorProfile à partir des tags du catalogue.
 * Retourne au minimum ["balanced"] pour satisfaire le schema Beer.
 */
function deriveFlavorProfile(tags: string[]): string[] {
  const flavors = tags
    .map((tag) => TAG_TO_FLAVOR[tag.toLowerCase()])
    .filter((f): f is string => f !== undefined);

  // Déduplique
  const unique = [...new Set(flavors)];

  return unique.length > 0 ? unique : ['balanced'];
}

/**
 * Détermine l'availability locale à partir du stock web et de la fermentation.
 *
 * Règles :
 *  - in_stock                          → 'available'
 *  - out_of_stock + comingSoon = true  → 'coming_soon'
 *  - out_of_stock sinon                → 'sold_out'
 */
function mapAvailability(pub: PublicBeer): 'available' | 'coming_soon' | 'sold_out' {
  if (pub.stock.availabilityWeb === 'in_stock') {
    return 'available';
  }

  if (pub.fermentation?.comingSoon) {
    return 'coming_soon';
  }

  return 'sold_out';
}

/**
 * Convertit une PublicBeer du catalogue en Beer locale.
 * Les champs absents du catalogue (hasSpecialEffect, hasGhosts) sont
 * mis à false par défaut — ils sont propres au site (easter eggs).
 */
export function mapCatalogBeerToLocalBeer(pub: PublicBeer): Beer {
  return {
    id: pub.id,
    name: pub.name,
    type: pub.style,
    description: pub.description,
    tags: pub.tags.length > 0 ? pub.tags : ['Artisanale'],
    flavorProfile: deriveFlavorProfile(pub.tags),
    pairings: pub.foodPairings.length > 0 ? pub.foodPairings : ['Apéritif'],
    abv: `${pub.abv.toFixed(1).replace('.', ',')}% alc.`,
    availability: mapAvailability(pub),
    season: pub.season ?? undefined,
    image: pub.image ? `/beers/${pub.image}` : DEFAULT_BEER_IMAGE_PATH,
    hasSpecialEffect: false,
    hasGhosts: false
  };
}

/**
 * Extrait les releases (sorties) depuis les données de fermentation du catalogue.
 *
 * Chaque bière avec une fermentation non-null produit une Release.
 * Le champ `volume` n'est pas dans le catalogue public (donnée interne),
 * on met un placeholder.
 */
export function mapCatalogToReleases(catalog: PublicCatalog): Release[] {
  return catalog.beers
    .filter((beer) => beer.fermentation !== null && beer.fermentation !== undefined)
    .map((beer) => {
      const ferm = beer.fermentation!;

      // Mapper le statut catalogue → statut local
      let status: 'brewing' | 'fermenting' | 'coming_soon' | 'available' | 'sold_out';
      if (ferm.status === 'fermenting') {
        status = 'fermenting';
      } else if (ferm.status === 'conditioning') {
        status = 'coming_soon';
      } else {
        status = 'brewing';
      }

      // Construire des notes suffisamment longues (min 10 chars requis par le schema)
      const baseLabel = ferm.statusLabel;
      const comingSoonSuffix = ferm.comingSoon ? ' — Arrive bientôt !' : '';
      const batchSuffix = ferm.batchCountInProgress > 1
        ? ` (${ferm.batchCountInProgress} brassins en cours)`
        : '';
      const notes = `${baseLabel}${comingSoonSuffix}${batchSuffix}`.padEnd(10, '.');

      return {
        id: `catalog-${beer.id}`,
        beerId: beer.id,
        batch: ferm.batchNumber ?? 'Brassin en cours',
        status,
        availableFrom: ferm.estimatedReadyDate ?? null,
        volume: '–',
        notes
      };
    });
}
