import { describe, it, expect } from 'vitest';
import { DEFAULT_BEER_IMAGE_PATH, mapCatalogBeerToLocalBeer, mapCatalogToReleases } from './catalog-mapper';
import { PublicCatalogSchema, PublicBeerSchema } from '../schemas/catalog.schema';
import type { PublicBeer, PublicCatalog } from '../schemas/catalog.schema';

// ─────────────────────────────────────────────
// Helpers : fixtures conformes au contrat JSON
// ─────────────────────────────────────────────

function makePublicBeer(overrides: Partial<PublicBeer> = {}): PublicBeer {
  return {
    id: 'american-pale-ale',
    name: 'American Pale Ale',
    style: 'Pale Ale',
    abv: 5.2,
    ibu: 40,
    color: { ebc: 12, srm: 6.1, label: 'Dorée' },
    description: 'Une bière houblonnée et rafraîchissante.',
    tastingNotes: 'Agrumes, pin, finale sèche.',
    ingredients: ['Malt Pale', 'Cascade', 'US-05'],
    tags: ['houblonnée', 'fruitée'],
    foodPairings: ['Burger', 'Tacos'],
    season: 'printemps-été',
    isLimitedEdition: false,
    image: 'apa.jpg',
    stock: {
      availableUnits: 48,
      availableVolumeL: 36,
      levelApp: 'full',
      labelApp: 'Bien garni',
      availabilityWeb: 'in_stock',
      labelWeb: 'En stock'
    },
    fermentation: null,
    updatedAt: '2026-02-18T10:00:00Z',
    ...overrides
  };
}

function makeCatalog(beers: PublicBeer[]): PublicCatalog {
  return {
    generatedAt: '2026-02-18T10:00:00Z',
    version: 1,
    brewery: { id: 'edb', name: "L'École du Bélier" },
    beers
  };
}

// ─────────────────────────────────────────────
// Schema Zod — validation
// ─────────────────────────────────────────────

describe('PublicCatalogSchema — validation Zod', () => {
  it('valide un catalogue complet conforme', () => {
    const catalog = makeCatalog([makePublicBeer()]);
    const result = PublicCatalogSchema.safeParse(catalog);
    expect(result.success).toBe(true);
  });

  it('rejette un id vide', () => {
    const beer = makePublicBeer({ id: '' });
    const result = PublicBeerSchema.safeParse(beer);
    expect(result.success).toBe(false);
  });

  it('rejette un name vide', () => {
    const beer = makePublicBeer({ name: '' });
    const result = PublicBeerSchema.safeParse(beer);
    expect(result.success).toBe(false);
  });

  it('rejette un availabilityWeb invalide', () => {
    const beer = makePublicBeer();
    (beer.stock as any).availabilityWeb = 'maybe';
    const result = PublicBeerSchema.safeParse(beer);
    expect(result.success).toBe(false);
  });

  it('accepte availabilityWeb in_stock et out_of_stock', () => {
    for (const val of ['in_stock', 'out_of_stock'] as const) {
      const beer = makePublicBeer();
      beer.stock.availabilityWeb = val;
      const result = PublicBeerSchema.safeParse(beer);
      expect(result.success).toBe(true);
    }
  });

  it('accepte une bière sans fermentation (null)', () => {
    const beer = makePublicBeer({ fermentation: null });
    const result = PublicBeerSchema.safeParse(beer);
    expect(result.success).toBe(true);
  });

  it('accepte une bière avec fermentation complète', () => {
    const beer = makePublicBeer({
      fermentation: {
        status: 'fermenting',
        statusLabel: 'En fermentation',
        batchNumber: 'B-2026-003',
        startDate: '2026-02-01',
        estimatedReadyDate: '2026-03-15',
        batchCountInProgress: 1,
        comingSoon: true
      }
    });
    const result = PublicBeerSchema.safeParse(beer);
    expect(result.success).toBe(true);
  });

  it('rejette si champ obligatoire manquant (style)', () => {
    const beer = makePublicBeer();
    delete (beer as any).style;
    const result = PublicBeerSchema.safeParse(beer);
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// mapCatalogBeerToLocalBeer
// ─────────────────────────────────────────────

describe('mapCatalogBeerToLocalBeer', () => {
  it('mappe les champs de base correctement', () => {
    const pub = makePublicBeer();
    const beer = mapCatalogBeerToLocalBeer(pub);

    expect(beer.id).toBe('american-pale-ale');
    expect(beer.name).toBe('American Pale Ale');
    expect(beer.type).toBe('Pale Ale');
    expect(beer.description).toBe('Une bière houblonnée et rafraîchissante.');
    expect(beer.tags).toEqual(['houblonnée', 'fruitée']);
    expect(beer.pairings).toEqual(['Burger', 'Tacos']);
    expect(beer.season).toBe('printemps-été');
    expect(beer.image).toBe('/beers/apa.jpg');
  });

  it('formate l\'ABV avec virgule française', () => {
    const pub = makePublicBeer({ abv: 5.2 });
    expect(mapCatalogBeerToLocalBeer(pub).abv).toBe('5,2% alc.');
  });

  it('formate un ABV entier avec une décimale', () => {
    const pub = makePublicBeer({ abv: 7.0 });
    expect(mapCatalogBeerToLocalBeer(pub).abv).toBe('7,0% alc.');
  });

  it('met hasSpecialEffect et hasGhosts à false', () => {
    const beer = mapCatalogBeerToLocalBeer(makePublicBeer());
    expect(beer.hasSpecialEffect).toBe(false);
    expect(beer.hasGhosts).toBe(false);
  });

  // ── Availability mapping ──

  it('in_stock → available', () => {
    const pub = makePublicBeer();
    pub.stock.availabilityWeb = 'in_stock';
    expect(mapCatalogBeerToLocalBeer(pub).availability).toBe('available');
  });

  it('out_of_stock + comingSoon → coming_soon', () => {
    const pub = makePublicBeer({
      stock: { ...makePublicBeer().stock, availabilityWeb: 'out_of_stock' },
      fermentation: {
        status: 'fermenting', statusLabel: 'En fermentation',
        batchNumber: null, startDate: null, estimatedReadyDate: null,
        batchCountInProgress: 1, comingSoon: true
      }
    });
    expect(mapCatalogBeerToLocalBeer(pub).availability).toBe('coming_soon');
  });

  it('out_of_stock sans comingSoon → sold_out', () => {
    const pub = makePublicBeer({
      stock: { ...makePublicBeer().stock, availabilityWeb: 'out_of_stock' },
      fermentation: null
    });
    expect(mapCatalogBeerToLocalBeer(pub).availability).toBe('sold_out');
  });

  // ── Flavor profile ──

  it('déduit le flavorProfile depuis les tags', () => {
    const pub = makePublicBeer({ tags: ['houblonnée', 'fruitée'] });
    expect(mapCatalogBeerToLocalBeer(pub).flavorProfile).toEqual(['hoppy', 'fruit-forward']);
  });

  it('retourne ["balanced"] si aucun tag ne matche', () => {
    const pub = makePublicBeer({ tags: ['inconnue', 'autre'] });
    expect(mapCatalogBeerToLocalBeer(pub).flavorProfile).toEqual(['balanced']);
  });

  it('déduplique les flavors identiques', () => {
    const pub = makePublicBeer({ tags: ['fruitée', 'nectarine'] }); // both → fruit-forward
    expect(mapCatalogBeerToLocalBeer(pub).flavorProfile).toEqual(['fruit-forward']);
  });

  // ── Fallbacks ──

  it('fallback tags vides → ["Artisanale"]', () => {
    const pub = makePublicBeer({ tags: [] });
    expect(mapCatalogBeerToLocalBeer(pub).tags).toEqual(['Artisanale']);
  });

  it('fallback pairings vides → ["Apéritif"]', () => {
    const pub = makePublicBeer({ foodPairings: [] });
    expect(mapCatalogBeerToLocalBeer(pub).pairings).toEqual(['Apéritif']);
  });

  it('image placeholder si absente du catalogue', () => {
    const pub = makePublicBeer({ image: null });
    expect(mapCatalogBeerToLocalBeer(pub).image).toBe(DEFAULT_BEER_IMAGE_PATH);
  });

  it('season undefined si absente du catalogue', () => {
    const pub = makePublicBeer({ season: null });
    expect(mapCatalogBeerToLocalBeer(pub).season).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// mapCatalogToReleases
// ─────────────────────────────────────────────

describe('mapCatalogToReleases', () => {
  it('retourne un tableau vide si aucune fermentation', () => {
    const catalog = makeCatalog([makePublicBeer({ fermentation: null })]);
    expect(mapCatalogToReleases(catalog)).toEqual([]);
  });

  it('génère une Release par bière avec fermentation', () => {
    const catalog = makeCatalog([
      makePublicBeer({
        id: 'ipa',
        fermentation: {
          status: 'fermenting', statusLabel: 'En fermentation',
          batchNumber: 'B-2026-003', startDate: '2026-02-01',
          estimatedReadyDate: '2026-03-15',
          batchCountInProgress: 1, comingSoon: true
        }
      })
    ]);
    const releases = mapCatalogToReleases(catalog);

    expect(releases).toHaveLength(1);
    expect(releases[0].id).toBe('catalog-ipa');
    expect(releases[0].beerId).toBe('ipa');
    expect(releases[0].status).toBe('fermenting');
    expect(releases[0].batch).toBe('B-2026-003');
    expect(releases[0].availableFrom).toBe('2026-03-15');
  });

  it('mappe conditioning → coming_soon', () => {
    const catalog = makeCatalog([
      makePublicBeer({
        fermentation: {
          status: 'conditioning', statusLabel: 'En garde',
          batchNumber: null, startDate: null, estimatedReadyDate: null,
          batchCountInProgress: 1, comingSoon: false
        }
      })
    ]);
    expect(mapCatalogToReleases(catalog)[0].status).toBe('coming_soon');
  });

  it('mappe un statut inconnu → brewing', () => {
    const catalog = makeCatalog([
      makePublicBeer({
        fermentation: {
          status: 'unknown', statusLabel: 'Inconnu',
          batchNumber: null, startDate: null, estimatedReadyDate: null,
          batchCountInProgress: 1, comingSoon: false
        }
      })
    ]);
    expect(mapCatalogToReleases(catalog)[0].status).toBe('brewing');
  });

  it('notes ≥ 10 caractères (contrainte Release schema)', () => {
    const catalog = makeCatalog([
      makePublicBeer({
        fermentation: {
          status: 'conditioning', statusLabel: 'En garde',
          batchNumber: null, startDate: null, estimatedReadyDate: null,
          batchCountInProgress: 1, comingSoon: false
        }
      })
    ]);
    const notes = mapCatalogToReleases(catalog)[0].notes;
    expect(notes.length).toBeGreaterThanOrEqual(10);
  });

  it('batch fallback si batchNumber null', () => {
    const catalog = makeCatalog([
      makePublicBeer({
        fermentation: {
          status: 'fermenting', statusLabel: 'En fermentation',
          batchNumber: null, startDate: null, estimatedReadyDate: null,
          batchCountInProgress: 1, comingSoon: false
        }
      })
    ]);
    expect(mapCatalogToReleases(catalog)[0].batch).toBe('Brassin en cours');
  });

  it('ignore les bières sans fermentation dans un catalogue mixte', () => {
    const catalog = makeCatalog([
      makePublicBeer({ id: 'with-ferm', fermentation: {
        status: 'fermenting', statusLabel: 'En fermentation',
        batchNumber: 'B-001', startDate: null, estimatedReadyDate: null,
        batchCountInProgress: 1, comingSoon: false
      }}),
      makePublicBeer({ id: 'without-ferm', fermentation: null })
    ]);
    const releases = mapCatalogToReleases(catalog);
    expect(releases).toHaveLength(1);
    expect(releases[0].beerId).toBe('with-ferm');
  });
});
