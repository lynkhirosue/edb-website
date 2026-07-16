import type { Beer } from '../schemas/beer.schema';
import type { Release } from '../schemas/release.schema';
import type { NormalizedPublicBeer, PublicCatalog } from '../schemas/catalog.schema';
import { resolveBeerImageURL } from '../config/catalog';

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
 */
function deriveFlavorProfile(tags: string[]): string[] {
  const flavors = tags
    .map((tag) => TAG_TO_FLAVOR[tag.toLowerCase()])
    .filter((f): f is string => f !== undefined);

  // Déduplique
  const unique = [...new Set(flavors)];

  return unique;
}

/**
 * Détermine l'availability locale à partir du stock web et de la fermentation.
 *
 * Règles :
 *  - lifecycle available                → 'available'
 *  - lifecycle in_production/in_design  → 'coming_soon'
 *  - lifecycle out_of_stock             → 'sold_out'
 *  - fallback legacy stock/fermentation
 */
function mapAvailability(pub: NormalizedPublicBeer): 'available' | 'coming_soon' | 'sold_out' {
  if (pub.lifecycle === 'available') {
    return pub.webStockLevel === 'out_of_stock' || pub.stock?.availabilityWeb === 'out_of_stock'
      ? 'sold_out'
      : 'available';
  }

  if (pub.lifecycle === 'in_production' || pub.lifecycle === 'in_design') {
    return 'coming_soon';
  }

  if (pub.lifecycle === 'out_of_stock') {
    return 'sold_out';
  }

  if (pub.isUpcoming) {
    return 'coming_soon';
  }

  if (pub.webStockLevel === 'in_stock' || pub.stock?.availabilityWeb === 'in_stock') {
    return 'available';
  }

  if (pub.fermentation?.comingSoon || pub.production) {
    return 'coming_soon';
  }

  return 'sold_out';
}

/**
 * Convertit une PublicBeer du catalogue en Beer locale.
 * Les champs absents du catalogue (hasSpecialEffect, hasGhosts) sont
 * mis à false par défaut, car ils sont propres au site (easter eggs).
 */
export function mapCatalogBeerToLocalBeer(pub: NormalizedPublicBeer): Beer {
  return {
    id: pub.id,
    name: pub.name,
    type: pub.style,
    description: pub.description,
    tags: pub.tags,
    flavorProfile: deriveFlavorProfile(pub.tags),
    pairings: pub.foodPairings,
    abv: pub.abv === null ? '' : `${pub.abv.toFixed(1).replace('.', ',')}% alc.`,
    availability: mapAvailability(pub),
    season: pub.season ?? undefined,
    image: resolveBeerImageURL(pub.image, DEFAULT_BEER_IMAGE_PATH),
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
    .filter((beer) => Boolean(beer.fermentation || beer.production))
    .map((beer) => {
      const ferm = beer.fermentation;
      const production = beer.production;
      const rawStatus = production?.status ?? ferm?.status ?? 'brewing';
      const statusLabel = production?.statusLabel ?? ferm?.statusLabel ?? 'Brassage en cours';
      const batchNumber = production?.batchNumber ?? ferm?.batchNumber;
      const estimatedReadyDate = production?.estimatedReadyAt ?? ferm?.estimatedReadyDate;

      // Mapper le statut catalogue → statut local
      let status: 'brewing' | 'fermenting' | 'coming_soon' | 'available' | 'sold_out';
      if (rawStatus === 'fermenting') {
        status = 'fermenting';
      } else if (rawStatus === 'conditioning') {
        status = 'coming_soon';
      } else {
        status = 'brewing';
      }

      // Construire des notes suffisamment longues (min 10 chars requis par le schema)
      const comingSoonSuffix = ferm?.comingSoon ? '. Elle se rapproche doucement.' : '';
      const notes = `${statusLabel}${comingSoonSuffix}`.padEnd(10, '.');

      return {
        id: `catalog-${beer.id}`,
        beerId: beer.id,
        batch: batchNumber ?? 'Brassin en cours',
        status,
        availableFrom: estimatedReadyDate ?? null,
        volume: '–',
        notes
      };
    });
}
