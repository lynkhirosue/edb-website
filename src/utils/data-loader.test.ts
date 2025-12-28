import { describe, it, expect } from 'vitest';
import { loadBeers, loadEquipment, loadBrewingSteps } from './data-loader';

describe('Data Loader', () => {
  describe('loadBeers', () => {
    it('should load and validate beers data', async () => {
      const beers = await loadBeers();

      expect(beers).toBeDefined();
      expect(Array.isArray(beers)).toBe(true);
      expect(beers.length).toBeGreaterThan(0);
    });

    it('should have required beer properties', async () => {
      const beers = await loadBeers();
      const firstBeer = beers[0];

      expect(firstBeer).toHaveProperty('id');
      expect(firstBeer).toHaveProperty('name');
      expect(firstBeer).toHaveProperty('type');
      expect(firstBeer).toHaveProperty('description');
      expect(firstBeer).toHaveProperty('tags');
      expect(firstBeer).toHaveProperty('abv');
      expect(firstBeer).toHaveProperty('hasSpecialEffect');
      expect(firstBeer).toHaveProperty('hasGhosts');
    });

    it('should have valid ABV format', async () => {
      const beers = await loadBeers();
      const abvPattern = /^\d+,\d+% alc\.$/;

      beers.forEach(beer => {
        expect(beer.abv).toMatch(abvPattern);
      });
    });

    it('should have at least one tag per beer', async () => {
      const beers = await loadBeers();

      beers.forEach(beer => {
        expect(beer.tags.length).toBeGreaterThan(0);
      });
    });
  });

  describe('loadEquipment', () => {
    it('should load and validate equipment data', async () => {
      const equipment = await loadEquipment();

      expect(equipment).toBeDefined();
      expect(Array.isArray(equipment)).toBe(true);
      expect(equipment.length).toBeGreaterThan(0);
    });

    it('should have required equipment properties', async () => {
      const equipment = await loadEquipment();
      const firstItem = equipment[0];

      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('description');
      expect(firstItem).toHaveProperty('image');
      expect(firstItem).toHaveProperty('capacity');
    });

    it('should have valid image paths', async () => {
      const equipment = await loadEquipment();

      equipment.forEach(item => {
        expect(item.image).toMatch(/^\//);
        expect(item.image).toMatch(/\.webp$/);
      });
    });
  });

  describe('loadBrewingSteps', () => {
    it('should load and validate brewing steps data', async () => {
      const steps = await loadBrewingSteps();

      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBe(7); // 7 étapes de brassage
    });

    it('should have required step properties', async () => {
      const steps = await loadBrewingSteps();
      const firstStep = steps[0];

      expect(firstStep).toHaveProperty('id');
      expect(firstStep).toHaveProperty('number');
      expect(firstStep).toHaveProperty('title');
      expect(firstStep).toHaveProperty('description');
      expect(firstStep).toHaveProperty('duration');
      expect(firstStep).toHaveProperty('temperature');
      expect(firstStep).toHaveProperty('icon');
    });

    it('should have sequential step numbers', async () => {
      const steps = await loadBrewingSteps();

      steps.forEach((step, index) => {
        const expectedNumber = (index + 1).toString().padStart(2, '0');
        expect(step.number).toBe(expectedNumber);
      });
    });

    it('should have valid temperature format or null', async () => {
      const steps = await loadBrewingSteps();
      const tempPattern = /^\d+-?\d*°C$/;

      steps.forEach(step => {
        if (step.temperature !== null) {
          expect(step.temperature).toMatch(tempPattern);
        }
      });
    });
  });
});
