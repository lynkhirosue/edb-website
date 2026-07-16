import { z } from 'zod';

export const PublicColorSchema = z.object({
  ebc: z.number().nonnegative(),
  srm: z.number().nonnegative(),
  label: z.string()
});

export const PublicBeerLifecycleSchema = z.enum([
  'available',
  'in_production',
  'in_design',
  'out_of_stock'
]);

export const PublicMetricProvenanceSchema = z.enum([
  'estimated',
  'live',
  'final'
]);

export const PublicTypedIngredientSchema = z.object({
  name: z.string().min(1),
  kind: z.string().min(1),
  role: z.string().nullable().optional(),
  amount: z.number().nonnegative().nullable().optional(),
  unit: z.string().nullable().optional(),
  lotNumber: z.string().nullable().optional()
});

export const PublicPackagingSchema = z.object({
  id: z.string().min(1),
  format: z.string().min(1),
  label: z.string().min(1),
  volumeL: z.number().positive(),
  count: z.number().int().nonnegative(),
  priceEUR: z.number().nonnegative()
});

export const PublicStockSchema = z.object({
  availableUnits: z.number().int().nonnegative(),
  availableVolumeL: z.number().nonnegative(),
  levelApp: z.string().min(1),
  labelApp: z.string().min(1),
  availabilityWeb: z.enum(['in_stock', 'out_of_stock']),
  labelWeb: z.string().min(1),
  packagings: z.array(PublicPackagingSchema).nullable().optional()
});

export const PublicFermentationSchema = z.object({
  status: z.string().min(1),
  statusLabel: z.string().min(1),
  batchNumber: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  estimatedReadyDate: z.string().nullable().optional(),
  batchCountInProgress: z.number().int().nonnegative(),
  comingSoon: z.boolean(),
  daysUntilReady: z.number().int().nullable().optional()
});

/**
 * Contrat public historique, versions 1 à 4.
 */
export const PublicBeerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  style: z.string(),
  abv: z.number().nonnegative(),
  ibu: z.number().nonnegative().nullable().optional(),
  color: PublicColorSchema,
  description: z.string(),
  tastingNotes: z.string().nullable().optional(),
  ingredients: z.array(z.string()),
  typedIngredients: z.array(PublicTypedIngredientSchema).nullable().optional(),
  tags: z.array(z.string()),
  foodPairings: z.array(z.string()),
  season: z.string().nullable().optional(),
  isLimitedEdition: z.boolean(),
  image: z.string().nullable().optional(),
  imageRasterValidated: z.boolean().nullable().optional(),
  imageIsTemporary: z.boolean().nullable().optional(),
  imageAttribution: z.string().nullable().optional(),
  stock: PublicStockSchema,
  fermentation: PublicFermentationSchema.nullable().optional(),
  isUpcoming: z.boolean().optional(),
  lifecycle: PublicBeerLifecycleSchema.nullable().optional(),
  lifecycleLabel: z.string().nullable().optional(),
  groupingKey: z.string().nullable().optional(),
  lifecycleVariants: z.array(PublicBeerLifecycleSchema).optional(),
  displayReadyDate: z.string().nullable().optional(),
  beerXML: z.string().min(1).nullable().optional(),
  updatedAt: z.string()
});

export const BreweryInfoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1)
});

export const PublicCatalogV4Schema = z.object({
  generatedAt: z.string(),
  version: z.number().int().refine((version) => version >= 1 && version <= 4),
  brewery: BreweryInfoSchema,
  beers: z.array(PublicBeerSchema)
});

const PublicMetricSchema = z.object({
  value: z.number().nonnegative(),
  provenance: PublicMetricProvenanceSchema
}).strict();

const PublicMetricSetV5Schema = z.object({
  abv: PublicMetricSchema.optional(),
  ibu: PublicMetricSchema.optional(),
  ebc: PublicMetricSchema.optional()
}).strict();

const PublicIngredientV5Schema = z.object({
  name: z.string().min(1),
  kind: z.string().min(1),
  role: z.string().min(1).optional(),
  amount: z.number().nonnegative().optional(),
  unit: z.string().min(1).optional(),
  supplierLotNumber: z.string().min(1).optional()
}).strict();

const PublicProductionV5Schema = z.object({
  batchID: z.string().min(1),
  batchNumber: z.string().min(1).optional(),
  status: z.string().min(1),
  statusLabel: z.string().min(1),
  startedAt: z.string().optional(),
  estimatedReadyAt: z.string().optional(),
  daysUntilReady: z.number().int().optional()
}).strict();

const PublicImageV5Schema = z.object({
  filename: z.string().min(1),
  rasterValidated: z.boolean().optional(),
  isTemporary: z.boolean().optional(),
  attribution: z.string().optional()
}).strict();

const PublicWebStockV5Schema = z.object({
  level: z.string().min(1),
  label: z.string().min(1)
}).strict();

const PublicActualStockV5Schema = z.object({
  availableUnits: z.number().int().nonnegative(),
  availableVolumeL: z.number().nonnegative(),
  packagings: z.array(PublicPackagingSchema)
}).strict();

const PublicStockV5Schema = z.object({
  web: PublicWebStockV5Schema,
  actual: PublicActualStockV5Schema
}).strict();

const PublicAvailableLotV5Schema = z.object({
  id: z.string().min(1),
  batchID: z.string().min(1),
  batchNumber: z.string().min(1).optional(),
  packagedAt: z.string().optional(),
  bestBefore: z.string().optional(),
  availableUnits: z.number().int().nonnegative(),
  availableVolumeL: z.number().nonnegative()
}).strict();

export const PublicBeerV5Schema = z.object({
  id: z.string().min(1),
  groupingKey: z.string().min(1),
  recipeRevision: z.number().int().positive().optional(),
  lifecycle: z.enum(['in_design', 'in_production', 'available']),
  name: z.string().min(1).optional(),
  style: z.string().min(1),
  metrics: PublicMetricSetV5Schema,
  description: z.string().optional(),
  ingredients: z.array(PublicIngredientV5Schema),
  foodPairings: z.array(z.string().min(1)).optional(),
  tastingNotes: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  production: PublicProductionV5Schema.optional(),
  image: PublicImageV5Schema.optional(),
  stock: PublicStockV5Schema.optional(),
  lots: z.array(PublicAvailableLotV5Schema).optional(),
  updatedAt: z.string()
}).strict();

export const PublicCatalogV5Schema = z.object({
  generatedAt: z.string(),
  version: z.literal(5),
  brewery: BreweryInfoSchema,
  beers: z.array(PublicBeerV5Schema)
}).strict();

export type PublicBeer = z.infer<typeof PublicBeerSchema>;
export type PublicBeerV5 = z.infer<typeof PublicBeerV5Schema>;
export type PublicCatalogV4 = z.infer<typeof PublicCatalogV4Schema>;
export type PublicCatalogV5 = z.infer<typeof PublicCatalogV5Schema>;
export type PublicBeerLifecycle = z.infer<typeof PublicBeerLifecycleSchema>;
export type PublicMetricProvenance = z.infer<typeof PublicMetricProvenanceSchema>;
export type PublicTypedIngredient = z.infer<typeof PublicTypedIngredientSchema>;
export type PublicColor = z.infer<typeof PublicColorSchema>;
export type PublicStock = z.infer<typeof PublicStockSchema>;
export type PublicPackaging = z.infer<typeof PublicPackagingSchema>;
export type PublicFermentation = z.infer<typeof PublicFermentationSchema>;
export type BreweryInfo = z.infer<typeof BreweryInfoSchema>;

export type PublicWebPackaging = {
  id: string;
  label: string;
  priceEUR: number;
};

export type NormalizedPublicBeer = {
  id: string;
  groupingKey: string;
  recipeRevision?: number;
  lifecycle: PublicBeerLifecycle;
  lifecycleLabel?: string | null;
  lifecycleVariants: PublicBeerLifecycle[];
  name: string;
  style: string;
  abv: number | null;
  ibu: number | null;
  ebc: number | null;
  metricProvenance?: PublicMetricProvenance;
  description: string;
  tastingNotes?: string | null;
  ingredients: string[];
  typedIngredients: PublicTypedIngredient[];
  tags: string[];
  foodPairings: string[];
  season?: string | null;
  isLimitedEdition: boolean;
  image?: string | null;
  imageRasterValidated?: boolean | null;
  imageIsTemporary?: boolean | null;
  imageAttribution?: string | null;
  stock?: PublicStock;
  webStockLevel?: string;
  webStockLabel?: string;
  publicPackagings: PublicWebPackaging[];
  fermentation?: PublicFermentation | null;
  production?: z.infer<typeof PublicProductionV5Schema>;
  isUpcoming: boolean;
  displayReadyDate?: string | null;
  updatedAt: string;
  catalogVersion: number;
};

export type PublicCatalog = {
  generatedAt: string;
  version: number;
  brewery: BreweryInfo;
  beers: NormalizedPublicBeer[];
};

function normalizeV4(catalog: PublicCatalogV4): PublicCatalog {
  return {
    ...catalog,
    beers: catalog.beers.map((beer) => ({
      ...beer,
      groupingKey: beer.groupingKey?.trim() || beer.id,
      lifecycle:
        beer.lifecycle ??
        (beer.isUpcoming || beer.fermentation?.comingSoon
          ? 'in_production'
          : beer.stock.availabilityWeb === 'in_stock'
            ? 'available'
            : 'out_of_stock'),
      lifecycleVariants: beer.lifecycleVariants ?? [],
      abv: beer.abv,
      ibu: beer.ibu ?? null,
      ebc: beer.color.ebc,
      typedIngredients: beer.typedIngredients ?? [],
      isUpcoming: beer.isUpcoming ?? false,
      webStockLevel: beer.stock.availabilityWeb,
      webStockLabel: beer.stock.labelWeb,
      publicPackagings: [],
      catalogVersion: catalog.version
    }))
  };
}

function normalizeV5(catalog: PublicCatalogV5): PublicCatalog {
  return {
    generatedAt: catalog.generatedAt,
    version: catalog.version,
    brewery: catalog.brewery,
    beers: catalog.beers.map((beer) => ({
      id: beer.id,
      groupingKey: beer.groupingKey,
      recipeRevision: beer.recipeRevision,
      lifecycle: beer.lifecycle,
      lifecycleVariants: [],
      name: beer.name ?? beer.style,
      style: beer.style,
      abv: beer.metrics.abv?.value ?? null,
      ibu: beer.metrics.ibu?.value ?? null,
      ebc: beer.metrics.ebc?.value ?? null,
      metricProvenance:
        beer.metrics.abv?.provenance ??
        beer.metrics.ibu?.provenance ??
        beer.metrics.ebc?.provenance,
      description: beer.description ?? '',
      tastingNotes: beer.tastingNotes,
      ingredients: beer.ingredients.map((ingredient) => ingredient.name),
      typedIngredients: beer.ingredients.map((ingredient) => ({
        name: ingredient.name,
        kind: ingredient.kind,
        role: ingredient.role,
        amount: ingredient.amount,
        unit: ingredient.unit,
        lotNumber: ingredient.supplierLotNumber
      })),
      tags: beer.tags ?? [],
      foodPairings: beer.foodPairings ?? [],
      isLimitedEdition: false,
      image: beer.image?.filename,
      imageRasterValidated: beer.image?.rasterValidated,
      imageIsTemporary: beer.image?.isTemporary,
      imageAttribution: beer.image?.attribution,
      webStockLevel: beer.stock?.web.level,
      webStockLabel: beer.stock?.web.label,
      publicPackagings: [],
      production: beer.production,
      isUpcoming: beer.lifecycle === 'in_production',
      updatedAt: beer.updatedAt,
      catalogVersion: catalog.version
    }))
  };
}

export const PublicCatalogSchema = z
  .union([PublicCatalogV5Schema, PublicCatalogV4Schema])
  .transform((catalog): PublicCatalog =>
    catalog.version === 5 ? normalizeV5(catalog) : normalizeV4(catalog)
  );
