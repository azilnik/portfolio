// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // The live site URL — used for canonical links, sitemap, and Open Graph tags.
  site: 'https://ari.design',

  // Emit /work and /about without trailing slashes. Prevents duplicate-URL
  // indexing (/work vs /work/) and keeps the canonical tag honest.
  trailingSlash: 'never',

  integrations: [
    mdx(),
    // Generates /sitemap-index.xml and /sitemap-0.xml at build time.
    // Auto-discovers every static route, including the dynamic case studies.
    sitemap(),
  ],

  vite: {
    // Tailwind CSS v4 uses a Vite plugin instead of the older @astrojs/tailwind integration.
    plugins: [tailwindcss()],
  },

  // Use Sharp for automatic image optimization (WebP, AVIF, srcset).
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
