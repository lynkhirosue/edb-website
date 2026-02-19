import type { Beer } from '../schemas/beer.schema';

export type QuizIntensity = 'light' | 'balanced' | 'bold';
export type QuizAroma = 'hoppy' | 'malty' | 'spicy' | 'fruity';
export type QuizOccasion = 'apero' | 'meal' | 'cozy';
export type QuizFinish = 'dry' | 'round';
export type QuizAdventure = 'classic' | 'surprise';

export interface QuizAnswers {
  intensity: QuizIntensity;
  aroma: QuizAroma;
  occasion: QuizOccasion;
  finish: QuizFinish;
  adventure: QuizAdventure;
}

export interface QuizRecommendation {
  beer: Beer;
  score: number;
  reasons: string[];
}

const AVAILABILITY_BONUS: Record<Beer['availability'], number> = {
  available: 1,
  coming_soon: 0.25,
  sold_out: -2
};

function parseAbv(abv: string): number {
  return Number.parseFloat(abv.replace('% alc.', '').replace(',', '.'));
}

function includesAny(haystack: string[], terms: string[]): boolean {
  const normalizedHaystack = haystack.map((item) => item.toLowerCase());
  return terms.some((term) => normalizedHaystack.some((value) => value.includes(term)));
}

function scoreIntensity(beer: Beer, intensity: QuizIntensity): number {
  const abv = parseAbv(beer.abv);

  if (intensity === 'light') {
    if (abv <= 5) return 3;
    if (abv <= 6.5) return 1;
    return 0;
  }

  if (intensity === 'balanced') {
    if (abv >= 4.8 && abv <= 6.8) return 3;
    if (abv > 6.8 && abv <= 7.8) return 1;
    return 0;
  }

  if (abv >= 7.5) return 3;
  if (abv >= 6.5) return 1;
  return 0;
}

function scoreAroma(beer: Beer, aroma: QuizAroma): number {
  const aromaticTerms: Record<QuizAroma, string[]> = {
    hoppy: ['hoppy', 'houbl', 'amertume'],
    malty: ['malty', 'malt', 'caramel', 'grainy'],
    spicy: ['spicy', 'epice', 'épic'],
    fruity: ['fruit', 'floral', 'nectarine']
  };

  const source = [...beer.flavorProfile, ...beer.tags, beer.type];
  return includesAny(source, aromaticTerms[aroma]) ? 3 : 0;
}

function scoreOccasion(beer: Beer, occasion: QuizOccasion): number {
  const pairingTerms: Record<QuizOccasion, string[]> = {
    apero: ['apéritif', 'salade', 'frais', 'poissons'],
    meal: ['pizza', 'viandes', 'plats', 'charcut', 'volaille', 'burger'],
    cozy: ['dessert', 'mijot', 'tarte', 'chocolat', 'courges']
  };

  return includesAny(beer.pairings, pairingTerms[occasion]) ? 2 : 0;
}

function scoreFinish(beer: Beer, finish: QuizFinish): number {
  const dryProfile = ['dry-finish', 'crisp', 'light-body'];
  const roundProfile = ['rich-body', 'malty', 'caramel', 'balanced'];

  if (finish === 'dry') {
    return includesAny(beer.flavorProfile, dryProfile) ? 2 : 0;
  }

  return includesAny(beer.flavorProfile, roundProfile) ? 2 : 0;
}

function scoreAdventure(beer: Beer, adventure: QuizAdventure): number {
  const beerType = beer.type.toLowerCase();
  const isClassic = beerType.includes('lager') || beerType.includes('pale ale') || beerType.includes('saison');
  const isSurprise = beerType.includes('specialty') || beerType.includes('imperial') || beerType.includes('seasonal');

  if (adventure === 'classic') {
    return isClassic ? 2 : 0;
  }

  return isSurprise ? 2 : 0;
}

function buildReasons(beer: Beer, answers: QuizAnswers): string[] {
  const reasons: string[] = [];

  if (scoreAroma(beer, answers.aroma) > 0) {
    const labelMap: Record<QuizAroma, string> = {
      hoppy: 'profil houblonné',
      malty: 'profil malté',
      spicy: 'profil épicé',
      fruity: 'profil fruité'
    };
    reasons.push(labelMap[answers.aroma]);
  }

  if (scoreFinish(beer, answers.finish) > 0) {
    reasons.push(answers.finish === 'dry' ? 'finale sèche' : 'texture ronde');
  }

  if (scoreOccasion(beer, answers.occasion) > 0) {
    const occasionMap: Record<QuizOccasion, string> = {
      apero: 'parfaite pour l’apéro',
      meal: 'idéale à table',
      cozy: 'adaptée aux moments cocooning'
    };
    reasons.push(occasionMap[answers.occasion]);
  }

  if (beer.availability === 'available') {
    reasons.push('disponible actuellement');
  }

  return reasons.slice(0, 3);
}

export function recommendBeer(beers: Beer[], answers: QuizAnswers): QuizRecommendation {
  if (beers.length === 0) {
    throw new Error('Aucune bière disponible pour la recommandation');
  }

  const ranked = beers
    .map((beer) => {
      const score =
        scoreIntensity(beer, answers.intensity) +
        scoreAroma(beer, answers.aroma) +
        scoreOccasion(beer, answers.occasion) +
        scoreFinish(beer, answers.finish) +
        scoreAdventure(beer, answers.adventure) +
        AVAILABILITY_BONUS[beer.availability];

      return {
        beer,
        score,
        reasons: buildReasons(beer, answers)
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (AVAILABILITY_BONUS[b.beer.availability] !== AVAILABILITY_BONUS[a.beer.availability]) {
        return AVAILABILITY_BONUS[b.beer.availability] - AVAILABILITY_BONUS[a.beer.availability];
      }

      return a.beer.id.localeCompare(b.beer.id);
    });

  return ranked[0];
}
