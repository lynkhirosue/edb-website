import { z } from 'zod';

// ─────────────────────────────────────────────
// Schéma Zod miroir du contrat public-catalog.json
// Correspond 1:1 aux structures PublicCatalogDTO.swift (Sprint 1)
// ─────────────────────────────────────────────

/**
 * Couleur de la bière (EBC, SRM, label humain)
 */
export const PublicColorSchema = z.object({
  ebc: z.number(),
  srm: z.number(),
  label: z.string()
});

/**
 * Stock public — niveaux granulaires (app) et binaires (web)
 */
export const PublicStockSchema = z.object({
  availableUnits: z.number(),
  availableVolumeL: z.number(),
  levelApp: z.string(),
  labelApp: z.string(),
  availabilityWeb: z.enum(['in_stock', 'out_of_stock']),
  labelWeb: z.string()
});

/**
 * Fermentation en cours (nullable si aucun batch actif)
 */
export const PublicFermentationSchema = z.object({
  status: z.string(),
  statusLabel: z.string(),
  batchNumber: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  estimatedReadyDate: z.string().nullable().optional(),
  batchCountInProgress: z.number(),
  comingSoon: z.boolean()
});

/**
 * Bière individuelle dans le catalogue
 */
export const PublicBeerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  style: z.string().min(1),
  abv: z.number(),
  ibu: z.number().nullable().optional(),
  color: PublicColorSchema,
  description: z.string(),
  tastingNotes: z.string().nullable().optional(),
  ingredients: z.array(z.string()),
  tags: z.array(z.string()),
  foodPairings: z.array(z.string()),
  season: z.string().nullable().optional(),
  isLimitedEdition: z.boolean(),
  image: z.string().nullable().optional(),
  stock: PublicStockSchema,
  fermentation: PublicFermentationSchema.nullable().optional(),
  updatedAt: z.string()
});

/**
 * Informations brasserie
 */
export const BreweryInfoSchema = z.object({
  id: z.string(),
  name: z.string()
});

/**
 * Catalogue complet (racine du JSON)
 */
export const PublicCatalogSchema = z.object({
  generatedAt: z.string(),
  version: z.number(),
  brewery: BreweryInfoSchema,
  beers: z.array(PublicBeerSchema)
});

// ─────────────────────────────────────────────
// Types inférés
// ─────────────────────────────────────────────

export type PublicCatalog = z.infer<typeof PublicCatalogSchema>;
export type PublicBeer = z.infer<typeof PublicBeerSchema>;
export type PublicColor = z.infer<typeof PublicColorSchema>;
export type PublicStock = z.infer<typeof PublicStockSchema>;
export type PublicFermentation = z.infer<typeof PublicFermentationSchema>;
export type BreweryInfo = z.infer<typeof BreweryInfoSchema>;
