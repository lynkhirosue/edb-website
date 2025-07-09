import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://lecoledubelier.beer',

  image: {
    domains: ['lecoledubelier.beer'],
  },

  vite: {
    plugins: [tailwindcss()]
  }
});