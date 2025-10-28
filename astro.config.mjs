import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lecoledubelier.beer',

  image: {
    domains: ['lecoledubelier.beer'],
  },

  vite: {
    plugins: []
  }
});