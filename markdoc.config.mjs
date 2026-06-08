import { defineMarkdocConfig, component, nodes } from "@astrojs/markdoc/config";

/**
 * Typographic quotes. MDX rendered prose through remark-smartypants, which
 * gave curly quotes and apostrophes; Markdoc emits text verbatim. We re-apply
 * the substitution at render time (on text nodes only — never code) so the
 * editor can keep typing plain straight quotes and the site still publishes
 * “curly” ones. Quotes only — dashes/ellipses in the source are already typed
 * as the literal characters.
 */
function smartQuotes(text) {
  return text
    .replace(/(^|[\s([{<—–])"/g, "$1“") // opening double
    .replace(/"/g, "”") // closing double
    .replace(/(^|[\s([{<—–])'/g, "$1‘") // opening single
    .replace(/'/g, "’"); // closing single / apostrophe
}

/**
 * Markdoc render config — maps each `{% tag %}` in a case study's .mdoc body
 * to the Astro component that renders it.
 *
 * This is the read side. The write side lives in keystatic.config.ts, where
 * each of these tags is mirrored as an editor block. The tag names here MUST
 * match the component keys there, or what the editor writes won't render.
 *
 * Components with children (callout, impact) receive their inner content via
 * the component's default <slot>. Image figures take a string `src` that
 * resolveContentImage() turns back into an optimized asset.
 */
const size = { type: String, matches: ["column", "wide", "full"] };

export default defineMarkdocConfig({
  nodes: {
    // Apply curly-quote typography to body text without disturbing any other
    // node behavior (code, links, headings render as before).
    text: {
      ...nodes.text,
      transform: (node) => smartQuotes(node.attributes.content),
    },
  },
  tags: {
    callout: {
      render: component("./src/components/mdx/Callout.astro"),
      attributes: {
        label: { type: String },
      },
    },
    impact: {
      render: component("./src/components/mdx/Impact.astro"),
      attributes: {
        label: { type: String },
      },
    },
    figure: {
      render: component("./src/components/mdx/FullBleedImage.astro"),
      attributes: {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        size,
        caption: { type: String },
      },
    },
    gif: {
      render: component("./src/components/mdx/FullBleedGif.astro"),
      attributes: {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        size,
        caption: { type: String },
      },
    },
    imagegrid: {
      render: component("./src/components/mdx/ImageGrid.astro"),
      attributes: {
        images: { type: Array, required: true },
        size,
        caption: { type: String },
      },
    },
    metacards: {
      render: component("./src/components/mdx/MetaCards.astro"),
      attributes: {
        cards: { type: Array, required: true },
      },
    },
    credits: {
      render: component("./src/components/mdx/Credits.astro"),
      attributes: {
        credits: { type: Array, required: true },
        note: { type: String },
      },
    },
    lessons: {
      render: component("./src/components/mdx/Lessons.astro"),
      attributes: {
        lessons: { type: Array, required: true },
        heading: { type: String },
      },
    },
    pivotcard: {
      render: component("./src/components/mdx/PivotCard.astro"),
      attributes: {
        summary: { type: String, required: true },
        cause: { type: String, required: true },
        result: { type: String, required: true },
      },
    },
    pressquote: {
      render: component("./src/components/mdx/PressQuote.astro"),
      attributes: {
        quote: { type: String, required: true },
        source: { type: String, required: true },
        url: { type: String },
      },
    },
    video: {
      render: component("./src/components/mdx/VideoPlayer.astro"),
      attributes: {
        src: { type: String, required: true },
        webm: { type: String },
        fallback: { type: String, required: true },
        alt: { type: String, required: true },
        size,
        caption: { type: String },
      },
    },
  },
});
