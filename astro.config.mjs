// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // The live site URL — used for canonical links, sitemap, and Open Graph tags.
  site: 'https://ari.design',

  integrations: [mdx()],

  vite: {
    // Tailwind CSS v4 uses a Vite plugin instead of the older @astrojs/tailwind integration.
    plugins: [tailwindcss()],
  },

  // Use Sharp for automatic image optimization (WebP, AVIF, srcset).
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
