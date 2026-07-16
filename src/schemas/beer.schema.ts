import { z } from 'zod';

/**
 * Schema de validation pour une bière
 */
export const BeerSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  name: z.string().min(1, "Le nom est requis"),
  type: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  flavorProfile: z.array(z.string()),
  pairings: z.array(z.string()),
  abv: z.string().regex(/^\d+,\d+% alc\.$|^$/, "Format ABV invalide (ex: 6,2% alc.)"),
  availability: z.enum(['available', 'coming_soon', 'sold_out']),
  season: z.string().optional(),
  image: z.string().optional(),
  hasSpecialEffect: z.boolean(),
  hasGhosts: z.boolean()
});

/**
 * Type TypeScript inféré du schéma Zod
 */
export type Beer = z.infer<typeof BeerSchema>;

/**
 * Schema pour un tableau de bières
 */
export const BeersArraySchema = z.array(BeerSchema);
