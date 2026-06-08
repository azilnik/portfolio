// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Keystatic is a local-only editing layer: its admin UI (/keystatic) and the
// React runtime it needs only load during `astro dev`. The production build
// stays fully static — no adapter, no SSR — so `astro build` output is
// unchanged. Vite sets NODE_ENV to 'production' during build, 'development'
// during dev, which is the switch we hang this on.
const keystaticEnabled = process.env.NODE_ENV !== 'production';

// https://astro.build/config
export default defineConfig({
  // The live site URL — used for canonical links, sitemap, and Open Graph tags.
  site: 'https://ari.design',

  // Emit /work and /about without trailing slashes. Prevents duplicate-URL
  // indexing (/work vs /work/) and keeps the canonical tag honest.
  trailingSlash: 'never',

  integrations: [
    // Case study bodies are Markdoc (.mdoc) — the format Keystatic edits and
    // Astro renders.
    markdoc(),
    // Generates /sitemap-index.xml and /sitemap-0.xml at build time.
    // Auto-discovers every static route, including the dynamic case studies.
    sitemap(),
    // react() powers Keystatic's admin UI — dev-only alongside keystatic().
    ...(keystaticEnabled ? [react(), keystatic()] : []),
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
