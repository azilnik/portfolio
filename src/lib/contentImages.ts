import type { ImageMetadata } from "astro";

/**
 * Resolve a case-study body image referenced by string path into the
 * `ImageMetadata` Astro's `<Image>` needs.
 *
 * Why this exists: frontmatter images flow through Astro's content-collection
 * `image()` schema, but Markdoc tag attributes are plain strings — a CMS
 * writes `/src/content/work/images/foo.png`, not an ESM `import`. Eagerly
 * globbing the image directory lets those string paths still pass through
 * Sharp (WebP/AVIF, srcset) instead of shipping the original untouched.
 *
 * Keystatic writes body-image paths absolute-from-root (`/src/content/...`);
 * we also accept the `./images/...` relative form for safety.
 */
// Images are namespaced per case study (src/content/work/images/<slug>/…) to
// match Keystatic's slug-scoped asset paths, so this glob recurses.
const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/content/work/images/**/*.{png,jpg,jpeg,gif,webp,avif,PNG,JPG,JPEG}",
  { eager: true }
);

const DIR = "/src/content/work/images/";

export function resolveContentImage(src: string | ImageMetadata): ImageMetadata {
  // Already an imported asset (e.g. a frontmatter image passed straight through).
  if (typeof src !== "string") return src;

  const key = src.startsWith("./images/")
    ? DIR + src.slice("./images/".length)
    : src;

  const mod = images[key];
  if (!mod) {
    throw new Error(
      `resolveContentImage: no image found for "${src}". ` +
        `Expected a file in src/content/work/images/. ` +
        `Known: ${Object.keys(images).join(", ") || "(none)"}`
    );
  }
  return mod.default;
}
