import { describe, it, expect } from 'vitest';
import {
  loadBeers,
  loadEquipment,
  loadBrewingSteps,
  loadReleases,
  loadEvents
} from './data-loader';

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
      expect(firstBeer).toHaveProperty('flavorProfile');
      expect(firstBeer).toHaveProperty('pairings');
      expect(firstBeer).toHaveProperty('abv');
      expect(firstBeer).toHaveProperty('availability');
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

    it('should have flavor profile and pairings', async () => {
      const beers = await loadBeers();

      beers.forEach((beer) => {
        expect(beer.flavorProfile.length).toBeGreaterThan(0);
        expect(beer.pairings.length).toBeGreaterThan(0);
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

  describe('loadReleases', () => {
    it('should load and validate releases data', async () => {
      const releases = await loadReleases();

      expect(releases).toBeDefined();
      expect(Array.isArray(releases)).toBe(true);
      expect(releases.length).toBeGreaterThan(0);
    });

    it('should only contain allowed statuses', async () => {
      const releases = await loadReleases();
      const allowed = new Set(['coming_soon', 'fermenting', 'brewing', 'available', 'sold_out']);

      releases.forEach((release) => {
        expect(allowed.has(release.status)).toBe(true);
      });
    });
  });

  describe('loadEvents', () => {
    it('should load and validate events data', async () => {
      const events = await loadEvents();

      expect(events).toBeDefined();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should have valid date and time formats', async () => {
      const events = await loadEvents();
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      const timePattern = /^\d{2}:\d{2}$/;

      events.forEach((event) => {
        expect(event.date).toMatch(datePattern);
        expect(event.startTime).toMatch(timePattern);
        expect(event.endTime).toMatch(timePattern);
      });
    });
  });
});
