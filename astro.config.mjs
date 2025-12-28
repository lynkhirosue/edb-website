import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lecoledubelier.beer',

  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],

  image: {
    domains: ['lecoledubelier.beer'],
  },

  vite: {
    plugins: []
  }
});