import { z } from 'zod';

export const ReleaseStatusSchema = z.enum(['coming_soon', 'fermenting', 'brewing', 'available', 'sold_out']);

export const ReleaseSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  beerId: z.string().min(1, "L'ID de bière est requis"),
  batch: z.string().min(1, 'Le numéro de brassin est requis'),
  status: ReleaseStatusSchema,
  availableFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de sortie invalide (YYYY-MM-DD)')
    .nullable()
    .optional(),
  volume: z.string().min(1, 'Le volume est requis'),
  notes: z.string().min(10, 'Les notes doivent faire au moins 10 caractères')
});

export type Release = z.infer<typeof ReleaseSchema>;
export type ReleaseStatus = z.infer<typeof ReleaseStatusSchema>;

export const ReleasesArraySchema = z.array(ReleaseSchema);
