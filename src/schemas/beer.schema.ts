import { z } from 'zod';

/**
 * Schema de validation pour une bière
 */
export const BeerSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  tags: z.array(z.string()).min(1, "Au moins un tag est requis"),
  abv: z.string().regex(/^\d+,\d+% alc\.$/, "Format ABV invalide (ex: 6,2% alc.)"),
  hasSpecialEffect: z.boolean(),
  hasGhosts: z.boolean(),
  backgroundImage: z.string().optional()
});

/**
 * Type TypeScript inféré du schéma Zod
 */
export type Beer = z.infer<typeof BeerSchema>;

/**
 * Schema pour un tableau de bières
 */
export const BeersArraySchema = z.array(BeerSchema);
