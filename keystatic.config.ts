import { config, collection, fields } from "@keystatic/core";
import { block, wrapper } from "@keystatic/core/content-components";

/**
 * Keystatic — local visual editor for portfolio content.
 *
 * Runs only during `astro dev` (see astro.config.mjs). Edit at /keystatic;
 * changes write straight to the files in src/content/. Astro reads those same
 * files through its own content collections — Keystatic is the writer, Astro
 * is the reader, and they never touch each other at runtime.
 *
 * The frontmatter schema here mirrors src/content.config.ts; the body
 * `components` mirror markdoc.config.mjs. Keep both in sync — a block whose key
 * doesn't match a Markdoc tag will write content that won't render.
 */

// Width treatment shared by figures, grids, and video. Mirrors the `size`
// prop and the Markdoc `size` attribute.
const sizeField = (defaultValue: "column" | "wide" | "full") =>
  fields.select({
    label: "Width",
    description: "Column stays in the reading measure; wide and full break out.",
    options: [
      { label: "Column", value: "column" },
      { label: "Wide", value: "wide" },
      { label: "Full", value: "full" },
    ],
    defaultValue,
  });

// Body images live alongside frontmatter images but are referenced
// absolute-from-root so resolveContentImage() (the glob resolver) can find
// them. Frontmatter images use the relative `./images/` form instead.
const bodyImage = (label: string) =>
  fields.image({
    label,
    directory: "src/content/work/images",
    publicPath: "/src/content/work/images/",
    validation: { isRequired: true },
  });

// Editor blocks — one per Markdoc tag in markdoc.config.mjs. Keys MUST match.
const caseStudyComponents = {
  callout: wrapper({
    label: "Callout",
    description: "Highlighted note with an accent border. Type the body inside.",
    schema: {
      label: fields.text({ label: "Label", description: "Optional heading, e.g. “Key insight”." }),
    },
  }),
  impact: wrapper({
    label: "Impact",
    description: "One-line takeaway under a section heading. Type the body inside.",
    schema: {
      label: fields.text({ label: "Label", defaultValue: "Impact" }),
    },
  }),
  figure: block({
    label: "Image",
    description: "A captioned figure, optimized through Sharp.",
    schema: {
      src: bodyImage("Image"),
      alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
      size: sizeField("wide"),
      caption: fields.text({ label: "Caption" }),
    },
  }),
  gif: block({
    label: "GIF",
    description: "Animated GIF served from /videos/ (not Sharp-optimized).",
    schema: {
      src: fields.text({
        label: "GIF path",
        description: "Path under public/, e.g. /videos/my-anim.gif",
        validation: { isRequired: true },
      }),
      alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
      size: sizeField("column"),
      caption: fields.text({ label: "Caption" }),
    },
  }),
  imagegrid: block({
    label: "Image grid",
    description: "Two or three images side by side.",
    schema: {
      images: fields.array(
        fields.object({
          src: bodyImage("Image"),
          alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
        }),
        { label: "Images", itemLabel: (p) => p.fields.alt.value || "Image" }
      ),
      size: sizeField("wide"),
      caption: fields.text({ label: "Caption" }),
    },
  }),
  metacards: block({
    label: "Meta cards",
    description: "A row of label / value / note mini-cards.",
    schema: {
      cards: fields.array(
        fields.object({
          label: fields.text({ label: "Label" }),
          value: fields.text({ label: "Value" }),
          note: fields.text({ label: "Note" }),
        }),
        { label: "Cards", itemLabel: (p) => p.fields.value.value || "Card" }
      ),
    },
  }),
  credits: block({
    label: "Credits",
    description: "Who worked on this, by role.",
    schema: {
      credits: fields.array(
        fields.object({
          role: fields.text({ label: "Role" }),
          people: fields.text({ label: "People" }),
          url: fields.url({ label: "Link (optional)" }),
        }),
        { label: "Credits", itemLabel: (p) => p.fields.role.value || "Credit" }
      ),
      note: fields.text({ label: "Note", description: "e.g. “In flight at Join, 2026.”" }),
    },
  }),
  lessons: block({
    label: "Lessons",
    description: "A bulleted list of takeaways.",
    schema: {
      heading: fields.text({ label: "Heading", description: "Defaults to “What I’d do differently”." }),
      lessons: fields.array(fields.text({ label: "Lesson" }), {
        label: "Lessons",
        itemLabel: (p) => p.value || "Lesson",
      }),
    },
  }),
  pivotcard: block({
    label: "Pivot card",
    description: "A pivot: summary, cause, and result.",
    schema: {
      summary: fields.text({ label: "Summary", validation: { isRequired: true } }),
      cause: fields.text({ label: "Cause", validation: { isRequired: true } }),
      result: fields.text({ label: "Result", validation: { isRequired: true } }),
    },
  }),
  pressquote: block({
    label: "Press quote",
    description: "A pull quote from press coverage.",
    schema: {
      quote: fields.text({ label: "Quote", multiline: true, validation: { isRequired: true } }),
      source: fields.text({ label: "Source", validation: { isRequired: true } }),
      url: fields.url({ label: "Link (optional)" }),
    },
  }),
  video: block({
    label: "Video",
    description: "Autoplaying muted demo video served from /videos/.",
    schema: {
      src: fields.text({ label: "MP4 path", validation: { isRequired: true } }),
      webm: fields.text({ label: "WebM path (optional)" }),
      fallback: fields.text({ label: "GIF fallback path", validation: { isRequired: true } }),
      alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
      size: sizeField("wide"),
      caption: fields.text({ label: "Caption" }),
    },
  }),
};

export default config({
  storage: { kind: "local" },

  ui: {
    brand: { name: "ari.design" },
  },

  collections: {
    work: collection({
      label: "Case studies",
      path: "src/content/work/*",
      // The filename (slug) is editable independently of the editorial title,
      // so "Reporting Platform" can live at /work/join-reporting.
      slugField: "title",
      // Body is written as Markdoc into a `.mdoc` file alongside the frontmatter.
      format: { contentField: "content" },
      columns: ["title", "company"],
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            description: "Editorial H1 — long and narrative is fine.",
            validation: { isRequired: true },
          },
          slug: {
            label: "URL slug",
            description: "The /work/<slug> path. Change with care — it is the public URL.",
          },
        }),
        company: fields.text({ label: "Company", validation: { isRequired: true } }),
        role: fields.text({ label: "Role", validation: { isRequired: true } }),
        industry: fields.text({ label: "Industry", validation: { isRequired: true } }),
        description: fields.text({
          label: "Description",
          description: "Punchy 8–12 word lede. Shown under the title and as the card subtitle.",
          multiline: true,
          validation: { isRequired: true },
        }),
        seoTitle: fields.text({
          label: "SEO title",
          description: 'Optional. Short, keyword-tuned <title> (≤60 chars). Pattern: "{feature} at {company}".',
          validation: { length: { max: 60 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          description: "Optional. 140–160 char meta description. Falls back to Description.",
          multiline: true,
          validation: { length: { max: 200 } },
        }),
        heroImage: fields.image({
          label: "Hero image",
          directory: "src/content/work/images",
          publicPath: "./images/",
          validation: { isRequired: true },
        }),
        thumbnail: fields.image({
          label: "Thumbnail",
          directory: "src/content/work/images",
          publicPath: "./images/",
          validation: { isRequired: true },
        }),
        thumbnailAlt: fields.text({ label: "Thumbnail alt text", validation: { isRequired: true } }),
        employer: fields.select({
          label: "Employer",
          description: "Links this study to an employer block on the homepage.",
          options: [
            { label: "Join", value: "join" },
            { label: "Blockdaemon", value: "blockdaemon" },
            { label: "Gradle", value: "gradle" },
            { label: "Freelance", value: "freelance" },
            { label: "Side project", value: "side-project" },
          ],
          defaultValue: "join",
        }),
        metrics: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            value: fields.text({ label: "Value" }),
          }),
          {
            label: "Impact metrics",
            description: "1–3 metrics shown at the bottom of the case study.",
            itemLabel: (props) => props.fields.value.value || "Metric",
          }
        ),
        sortOrder: fields.number({
          label: "Sort order",
          description: "Lower sorts first in the /work grid and prev/next nav.",
          defaultValue: 0,
        }),
        draft: fields.checkbox({
          label: "Draft",
          description: "Hidden from the build when checked.",
          defaultValue: false,
        }),
        content: fields.markdoc({
          label: "Body",
          components: caseStudyComponents,
        }),
      },
    }),
  },
});
