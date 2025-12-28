import { z } from 'zod';

/**
 * Schema de validation pour une étape du processus de brassage
 */
export const BrewingStepSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  number: z.string().regex(/^\d{2}$/, "Le numéro doit être au format 01, 02, etc."),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  duration: z.string().min(1, "La durée est requise"),
  temperature: z.string().nullable(),
  icon: z.string().min(1, "L'icône est requise")
});

/**
 * Type TypeScript inféré du schéma Zod
 */
export type BrewingStep = z.infer<typeof BrewingStepSchema>;

/**
 * Schema pour un tableau d'étapes de brassage
 */
export const BrewingStepsArraySchema = z.array(BrewingStepSchema);
