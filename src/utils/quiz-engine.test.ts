import { describe, expect, it } from 'vitest';
import { loadBeers } from './data-loader';
import { recommendBeer, type QuizAnswers } from './quiz-engine';

const intensities: QuizAnswers['intensity'][] = ['light', 'balanced', 'bold'];
const aromas: QuizAnswers['aroma'][] = ['hoppy', 'malty', 'spicy', 'fruity'];
const occasions: QuizAnswers['occasion'][] = ['apero', 'meal', 'cozy'];
const finishes: QuizAnswers['finish'][] = ['dry', 'round'];
const adventures: QuizAnswers['adventure'][] = ['classic', 'surprise'];

describe('Quiz Engine', () => {
  it('should return a recommendation for every valid answer combination', async () => {
    const beers = await loadBeers();

    for (const intensity of intensities) {
      for (const aroma of aromas) {
        for (const occasion of occasions) {
          for (const finish of finishes) {
            for (const adventure of adventures) {
              const answers: QuizAnswers = {
                intensity,
                aroma,
                occasion,
                finish,
                adventure
              };

              const recommendation = recommendBeer(beers, answers);

              expect(recommendation).toBeDefined();
              expect(recommendation.beer).toBeDefined();
              expect(recommendation.beer.id).toBeTruthy();
              expect(Number.isFinite(recommendation.score)).toBe(true);
            }
          }
        }
      }
    }
  });

  it('should be deterministic for identical inputs', async () => {
    const beers = await loadBeers();
    const answers: QuizAnswers = {
      intensity: 'balanced',
      aroma: 'hoppy',
      occasion: 'meal',
      finish: 'dry',
      adventure: 'classic'
    };

    const first = recommendBeer(beers, answers);
    const second = recommendBeer(beers, answers);

    expect(first.beer.id).toBe(second.beer.id);
    expect(first.score).toBe(second.score);
  });

  it('should throw when no beers are provided', () => {
    const answers: QuizAnswers = {
      intensity: 'light',
      aroma: 'fruity',
      occasion: 'apero',
      finish: 'dry',
      adventure: 'classic'
    };

    expect(() => recommendBeer([], answers)).toThrowError(/Aucune bière disponible/i);
  });
});
