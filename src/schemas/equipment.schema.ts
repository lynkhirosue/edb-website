import { z } from 'zod';

/**
 * Schema de validation pour un équipement
 */
export const EquipmentSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  image: z.string().startsWith('/', "L'image doit être un chemin absolu"),
  capacity: z.string().min(1, "La capacité est requise")
});

/**
 * Type TypeScript inféré du schéma Zod
 */
export type Equipment = z.infer<typeof EquipmentSchema>;

/**
 * Schema pour un tableau d'équipements
 */
export const EquipmentArraySchema = z.array(EquipmentSchema);
