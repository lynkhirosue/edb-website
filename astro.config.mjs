import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://lecoledubelier.beer',
  integrations: [tailwind()],

  image: {
    domains: ['lecoledubelier.beer'],
  },

  vite: {
    plugins: [tailwindcss()]
  }
});