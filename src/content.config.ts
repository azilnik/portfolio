/**
 * Content Collections — schema definitions for case studies and testimonials.
 *
 * Astro validates every content file against these Zod schemas at build time.
 * If a required field is missing or has the wrong type, the build will fail
 * with a helpful error message pointing to the exact file and field.
 *
 * Docs: https://docs.astro.build/en/guides/content-collections/
 */
import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

/**
 * Work collection — one .mdx file per case study.
 *
 * Each file lives in `src/content/work/` and its filename becomes the URL slug
 * (e.g., `join-navigation.mdx` → `/work/join-navigation`).
 */
const work = defineCollection({
  loader: glob({ pattern: "**/*.mdoc", base: "./src/content/work" }),
  schema: ({ image }) =>
    z.object({
      // --- Core metadata ---
      title: z.string(),
      company: z.string(),
      role: z.string(),
      industry: z.string(),
      // Short tagline. Shown as the lede paragraph on the case study page
      // and as the card subtitle in the /work grid. Keep it punchy — 8-12 words.
      description: z.string(),
      // Optional SEO-optimized <title>. Keeps the <h1> editorial (long,
      // narrative) while the browser tab / SERP gets a short, keyword-tuned
      // title. Falls back to `${company} case study` in CaseStudyLayout.
      // Pattern: "{feature} at {company}" (e.g. "Scenarios at Join").
      seoTitle: z.string().max(60).optional(),
      // Optional longer meta description (140-160 chars). Taglines in
      // `description` are too short to work as meta descriptions — this
      // field carries the keyword density for SEO. Falls back to
      // `description` if not set.
      seoDescription: z.string().max(200).optional(),

      // --- Images (processed by Astro's image pipeline) ---
      heroImage: image(),
      thumbnail: image(),
      thumbnailAlt: z.string(),

      // --- Categorization ---
      // Links case studies to employer blocks on the homepage.
      employer: z.enum(["join", "blockdaemon", "gradle", "freelance", "side-project"]),

      // --- Impact metrics (shown at the bottom of the case study) ---
      // Each metric is a { label, value } pair, e.g., { label: "User Growth", value: "3x" }
      metrics: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        )
        .min(1)
        .max(3)
        .optional(),

      // --- Display order and visibility ---
      sortOrder: z.number().default(0),
      draft: z.boolean().default(false),
    }),
});

/**
 * Testimonials collection — a single JSON file with an array of quotes.
 *
 * Lives at `src/content/testimonials/testimonials.json`.
 */
const testimonials = defineCollection({
  loader: file("./src/content/testimonials/testimonials.json"),
  schema: ({ image }) =>
    z.object({
      quote: z.string(),
      authorName: z.string(),
      authorTitle: z.string(),
      // Optional headshot — drop a .jpg/.png into src/content/testimonials/avatars/
      avatar: image().optional(),
      linkedinUrl: z.string().url().optional(),
    }),
});

export const collections = { work, testimonials };
