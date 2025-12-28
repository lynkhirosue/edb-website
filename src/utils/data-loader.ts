import { BeersArraySchema, type Beer } from '../schemas/beer.schema';
import { EquipmentArraySchema, type Equipment } from '../schemas/equipment.schema';
import { BrewingStepsArraySchema, type BrewingStep } from '../schemas/process.schema';

/**
 * Charge et valide les données des bières depuis le fichier JSON
 * @returns Tableau de bières validées
 * @throws Error si la validation échoue
 */
export async function loadBeers(): Promise<Beer[]> {
  try {
    const beersData = await import('../data/beers.json');
    const parsed = BeersArraySchema.safeParse(beersData.default);

    if (!parsed.success) {
      console.error('Erreur de validation des bières:', parsed.error.format());
      throw new Error('Données de bières invalides');
    }

    return parsed.data;
  } catch (error) {
    console.error('Erreur lors du chargement des bières:', error);
    throw error;
  }
}

/**
 * Charge et valide les données des équipements depuis le fichier JSON
 * @returns Tableau d'équipements validés
 * @throws Error si la validation échoue
 */
export async function loadEquipment(): Promise<Equipment[]> {
  try {
    const equipmentData = await import('../data/equipment.json');
    const parsed = EquipmentArraySchema.safeParse(equipmentData.default);

    if (!parsed.success) {
      console.error('Erreur de validation des équipements:', parsed.error.format());
      throw new Error('Données d\'équipements invalides');
    }

    return parsed.data;
  } catch (error) {
    console.error('Erreur lors du chargement des équipements:', error);
    throw error;
  }
}

/**
 * Charge et valide les données du processus de brassage depuis le fichier JSON
 * @returns Tableau d'étapes de brassage validées
 * @throws Error si la validation échoue
 */
export async function loadBrewingSteps(): Promise<BrewingStep[]> {
  try {
    const processData = await import('../data/process.json');
    const parsed = BrewingStepsArraySchema.safeParse(processData.default);

    if (!parsed.success) {
      console.error('Erreur de validation du processus:', parsed.error.format());
      throw new Error('Données du processus invalides');
    }

    return parsed.data;
  } catch (error) {
    console.error('Erreur lors du chargement du processus:', error);
    throw error;
  }
}
