import { describe, expect, it } from 'vitest';
import { buildBeerDisplayItems } from './catalog-display';
import type { Beer } from '../schemas/beer.schema';
import type { PublicBeer, PublicCatalog } from '../schemas/catalog.schema';

function makeLocalBeer(overrides: Partial<Beer> = {}): Beer {
  return {
    id: 'saison-available',
    name: 'Saison',
    type: 'Farmhouse Ale',
    description: 'Une saison sèche, épicée et désaltérante.',
    tags: ['épicée'],
    flavorProfile: ['spicy'],
    pairings: ['Fromage'],
    abv: '5,8% alc.',
    availability: 'available',
    season: 'été',
    image: 'saison.webp',
    hasSpecialEffect: false,
    hasGhosts: false,
    ...overrides
  };
}

function makePublicBeer(overrides: Partial<PublicBeer> = {}): PublicBeer {
  return {
    id: 'saison-available',
    name: 'Saison',
    style: 'Farmhouse Ale',
    abv: 5.8,
    ibu: 28,
    color: { ebc: 10, srm: 5, label: 'Dorée' },
    description: 'Une saison sèche, épicée et désaltérante.',
    ingredients: ['Malt Pale', 'Saaz'],
    tags: ['épicée'],
    foodPairings: ['Fromage'],
    season: 'été',
    isLimitedEdition: false,
    image: 'saison.webp',
    stock: {
      availableUnits: 12,
      availableVolumeL: 3.96,
      levelApp: 'low',
      labelApp: 'Stock faible',
      availabilityWeb: 'in_stock',
      labelWeb: 'En stock'
    },
    fermentation: null,
    isUpcoming: false,
    lifecycle: 'available',
    lifecycleLabel: 'En stock',
    groupingKey: 'saison',
    lifecycleVariants: [],
    updatedAt: '2026-02-18T10:00:00Z',
    ...overrides
  };
}

function makeCatalog(beers: PublicBeer[]): PublicCatalog {
  return {
    generatedAt: '2026-02-18T10:00:00Z',
    version: 4,
    brewery: { id: 'edb', name: "L'École du Bélier" },
    beers
  };
}

describe('buildBeerDisplayItems', () => {
  it('garde un fallback propre sans catalogue public', () => {
    const items = buildBeerDisplayItems([makeLocalBeer()], null);

    expect(items).toHaveLength(1);
    expect(items[0].statusLabel).toBe('En stock');
    expect(items[0].lifecycleBadges).toEqual([]);
    expect(items[0].packagings).toEqual([]);
  });

  it('regroupe les variantes avec groupingKey', () => {
    const localBeers = [
      makeLocalBeer({ id: 'saison-available' }),
      makeLocalBeer({ id: 'saison-production', availability: 'coming_soon' })
    ];
    const catalog = makeCatalog([
      makePublicBeer({
        id: 'saison-available',
        lifecycle: 'available',
        lifecycleVariants: ['in_production']
      }),
      makePublicBeer({
        id: 'saison-production',
        stock: {
          ...makePublicBeer().stock,
          availableUnits: 0,
          availableVolumeL: 0,
          availabilityWeb: 'out_of_stock'
        },
        fermentation: {
          status: 'fermenting',
          statusLabel: 'En fermentation',
          batchNumber: 'B-2026-004',
          startDate: '2026-02-01T08:00:00Z',
          estimatedReadyDate: '2026-02-20T08:00:00Z',
          batchCountInProgress: 1,
          comingSoon: true,
          daysUntilReady: 12
        },
        isUpcoming: true,
        lifecycle: 'in_production',
        lifecycleLabel: 'Bientôt disponible',
        groupingKey: 'saison'
      })
    ]);

    const items = buildBeerDisplayItems(localBeers, catalog);

    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('saison-available');
    expect(items[0].statusLabel).toBe('En stock');
    expect(items[0].statusDetail).toContain('Nouveau brassin');
    expect(items[0].lifecycleBadges.map((badge) => badge.kind)).toEqual(['available', 'in_production']);
    expect(items[1].id).toBe('saison-production');
  });

  it('affiche in_design comme statut éditorial, pas rupture simple', () => {
    const catalog = makeCatalog([
      makePublicBeer({
        id: 'stout-design',
        stock: {
          ...makePublicBeer().stock,
          availableUnits: 0,
          availableVolumeL: 0,
          availabilityWeb: 'out_of_stock',
          labelWeb: 'Cave à sec'
        },
        lifecycle: 'in_design',
        lifecycleLabel: 'Recette en préparation',
        groupingKey: 'stout'
      })
    ]);

    const items = buildBeerDisplayItems(
      [makeLocalBeer({ id: 'stout-design', availability: 'sold_out' })],
      catalog
    );

    expect(items[0].statusKind).toBe('in_design');
    expect(items[0].statusLabel).toBe('On planche dessus');
    expect(items[0].statusDetail).toBe('Recette en préparation');
  });

  it('conserve deux versions de recette distinctes', () => {
    const catalog = makeCatalog([
      makePublicBeer({
        id: 'stout-design-v1',
        groupingKey: 'stout',
        lifecycle: 'in_design',
        lifecycleLabel: 'Recette V1'
      }),
      makePublicBeer({
        id: 'stout-design-v2',
        groupingKey: 'stout',
        lifecycle: 'in_design',
        lifecycleLabel: 'Recette V2'
      })
    ]);

    const items = buildBeerDisplayItems(
      [
        makeLocalBeer({ id: 'stout-design-v1' }),
        makeLocalBeer({ id: 'stout-design-v2' })
      ],
      catalog
    );

    expect(items.map((item) => item.id)).toEqual(['stout-design-v1', 'stout-design-v2']);
    expect(items.every((item) => item.groupingKey === 'stout')).toBe(true);
  });

  it('n’expose aucun packaging exact sur le web', () => {
    const catalog = makeCatalog([
      makePublicBeer({
        stock: {
          ...makePublicBeer().stock,
          packagings: [
            {
              id: 'bottle_033_5',
              format: 'bottle',
              label: 'Bouteille 33 cL',
              volumeL: 0.33,
              count: 12,
              priceEUR: 5
            }
          ]
        }
      })
    ]);

    const items = buildBeerDisplayItems([makeLocalBeer()], catalog);

    expect(items[0].packagings).toEqual([]);
  });
});
