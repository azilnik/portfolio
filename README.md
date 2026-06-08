# ari.design

Personal portfolio site for Ari Zilnik — designer building products at the intersection of design systems, developer tools, and complex workflows.

**Live at** [ari.design](https://ari.design)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Astro 5](https://astro.build) | Static site generator with file-based routing |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS via the `@tailwindcss/vite` plugin |
| [Markdoc](https://markdoc.dev) | Markdown + typed component tags for case study content |
| [Keystatic](https://keystatic.com) | Local visual editor for case study content (dev-only, at `/keystatic`) |
| [Sharp](https://sharp.pixelplumbing.com) | Automatic image optimization (WebP/AVIF, srcset, lazy loading) |
| [GoatCounter](https://www.goatcounter.com) | Privacy-friendly analytics (production only, no cookies) |
| [GitHub Actions](https://github.com/features/actions) | Automated deploy to GitHub Pages on every push to `main` |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
├── assets/images/          # Images processed by Astro's <Image> component
├── components/
│   ├── global/             # Header, Footer, MobileMenu, Navigation, GoatCounter
│   ├── home/               # Hero, TestimonialCarousel, WorkSection, EmployerBlock
│   ├── work/               # CaseStudyCard (work listing grid)
│   ├── casestudy/          # CaseStudyHero, ImpactMetrics
│   └── mdx/                # Body components (FullBleedImage, VideoPlayer, ImageGrid, Callout, …)
├── content/
│   ├── work/               # Case study .mdoc files (one per project)
│   │   └── images/         # Case study images
│   └── testimonials/       # testimonials.json
├── data/                   # TypeScript data (employers.ts, navigation.ts)
├── lib/                    # contentImages.ts (resolves body image paths → optimized assets)
├── layouts/                # BaseLayout → PageLayout → CaseStudyLayout
├── pages/                  # File-based routing
│   ├── index.astro         # Homepage
│   ├── about.astro         # About page
│   ├── 404.astro           # Error page
│   └── work/
│       ├── index.astro     # Work listing grid
│       └── [...slug].astro # Dynamic case study pages
└── styles/                 # global.css (Tailwind v4 theme + fonts)

public/
├── fonts/                  # Self-hosted variable fonts (DM Sans, Inter)
├── videos/                 # Converted screen recordings (.mp4 + .gif)
└── robots.txt

scripts/
├── convert-video.sh        # FFmpeg: screen recording → mp4 + gif
└── keystatic-roundtrip-check.ts  # Verifies a .mdoc still parses in Keystatic

keystatic.config.ts         # Visual editor schema (the writer)
markdoc.config.mjs          # Markdoc tag → component mapping (the renderer)
```

## Editing Content (Visual Editor)

The easiest way to add or edit a case study is the built-in **Keystatic** editor — a visual,
form-based UI with a rich-text body. No code, no Markdoc syntax.

```bash
npm run dev
# then open http://localhost:4321/keystatic
```

Edits write straight to the `.mdoc` files in `src/content/work/` (and images into
`src/content/work/images/`). Review the diff and commit when you're happy — nothing publishes
until you push. The editor runs **only in dev**; the production build stays fully static (no
server, no admin route).

Two halves keep this working, and they must stay in sync:

- **`keystatic.config.ts`** — the editing form: frontmatter fields + one block per body component.
- **`markdoc.config.mjs`** — how each `{% tag %}` renders to its Astro component.

A block's key in `keystatic.config.ts` must match its tag name in `markdoc.config.mjs`, or the
editor will write content that doesn't render. After hand-editing a `.mdoc`, you can sanity-check
it parses with `npx tsx scripts/keystatic-roundtrip-check.ts <slug>`.

> Before adding a new case study, skim the SEO/voice rules in [`docs/SEO.md`](./docs/SEO.md) — they
> prevent the title/description set from drifting over time and include a checklist for what each new
> study needs to set.

## Adding a Case Study by Hand

Case studies are [Markdoc](https://markdoc.dev) (`.mdoc`) files in `src/content/work/`. Frontmatter
is validated against a Zod schema at build time — missing or invalid fields throw a clear error.

### 1. Create the file

```bash
touch src/content/work/my-project.mdoc
```

### 2. Add frontmatter

```yaml
---
title: "Project Title"
company: "Company Name"
role: "Your Role"
industry: "Industry"
description: "One-line tagline shown on the card and as the lede."
seoTitle: "Feature at Company"
seoDescription: "Longer 120-160 char meta description with keyword coverage."
heroImage: "./images/my-project-hero.jpg"
thumbnail: "./images/my-project-thumb.jpg"
thumbnailAlt: "Alt text for the thumbnail"
employer: "join"          # "join" | "blockdaemon" | "gradle" | "freelance" | "side-project"
sortOrder: 1              # Lower numbers appear first
draft: false              # Set true to hide from production
metrics:                  # 1–3 impact metrics (optional)
  - label: "Metric Name"
    value: "+25%"
---
```

### 3. Write the body with Markdoc tags

No imports needed — tags map to components via `markdoc.config.mjs`. Regular markdown
(paragraphs, headings, lists, links, inline `code`) works as expected.

```markdoc
## The Challenge

A normal paragraph. Straight quotes become “curly” automatically.

{% figure src="/src/content/work/images/my-shot.png" alt="Full-width screenshot"
   caption="Optional caption." /%}

{% callout label="Key insight" %}
Callouts highlight important takeaways.
{% /callout %}

{% video src="/videos/my-recording.mp4" webm="/videos/my-recording.webm"
   fallback="/videos/my-recording.gif" alt="Prototype walkthrough"
   caption="Prototype walkthrough" /%}
```

Body images use an absolute `/src/content/work/images/…` path (resolved through Sharp by
`src/lib/contentImages.ts`). Video/GIF paths point at `public/videos/`. The page auto-generates
at `/work/my-project`.

## Body Components

Each is both a Markdoc tag (in `markdoc.config.mjs`) and an editor block (in `keystatic.config.ts`).

| Tag | Component | Purpose |
|-----|-----------|---------|
| `{% figure %}` | `FullBleedImage` | Captioned figure at column / wide / full width |
| `{% video %}` | `VideoPlayer` | Autoplay/muted/looping `<video>` with a GIF fallback |
| `{% gif %}` | `FullBleedGif` | Animated GIF figure (served from `public/videos/`) |
| `{% imagegrid %}` | `ImageGrid` | 2–3 images side-by-side, responsive (stacks on mobile) |
| `{% callout %}` | `Callout` | Highlighted aside with accent border and optional label |
| `{% impact %}` | `Impact` | One-line takeaway lead under a section heading |
| `{% metacards %}` | `MetaCards` | Row of label / value / note mini-cards |
| `{% credits %}` | `Credits` | Who worked on the project, by role |
| `{% lessons %}` | `Lessons` | Bulleted list of takeaways |
| `{% pivotcard %}` | `PivotCard` | A pivot: summary, cause, result |
| `{% pressquote %}` | `PressQuote` | Pull quote from press coverage |

## Converting Screen Recordings

The included script converts screen recordings to web-optimized MP4 + GIF:

```bash
# Requires FFmpeg: brew install ffmpeg
./scripts/convert-video.sh input.mov my-recording

# Output:
#   public/videos/my-recording.mp4  (H.264, no audio, max 1920px)
#   public/videos/my-recording.gif  (720px, 12fps, optimized palette)
```

Then reference it in MDX:

```mdx
<VideoPlayer src="/videos/my-recording" caption="Demo walkthrough" />
```

## Design Tokens

The design system is defined in `src/styles/global.css` using Tailwind v4's `@theme` directive:

- **Accent color:** `rgb(0, 89, 255)` → `var(--color-accent)`
- **Fonts:** DM Sans (headings), Inter (body) — self-hosted variable `.woff2` files
- **No `tailwind.config.js`** — Tailwind v4 uses CSS-native configuration

## Layout Hierarchy

Layouts nest to avoid repetition:

```
BaseLayout          → HTML shell, <head>, meta tags, fonts, GoatCounter
  └── PageLayout    → Header + mobile menu + <main> + Footer
        └── CaseStudyLayout → Metadata bar, hero image, prose area, impact metrics
```

## Deployment

The site auto-deploys via GitHub Actions on every push to `main`.

### First-time setup

1. In your GitHub repo, go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` — the workflow handles the rest

### Custom domain

The site is served at [ari.design](https://ari.design). If you fork this repo and want to use a different apex domain:

1. At your DNS provider, add four A records on the apex pointing at GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Apex domains can't use a `CNAME` record, so A records are required. Optional: add the matching AAAA records for IPv6 (`2606:50c0:8000-8003::153`) and a `www` CNAME pointing at `<user>.github.io`.
2. Update `public/CNAME` to contain your domain (one line, no protocol).
3. Update `astro.config.mjs` so `site:` matches your domain.
4. Push. GitHub Pages reads the `CNAME` file from the deployed artifact and binds the repo to that domain, then provisions a Let's Encrypt cert.

## License

This is a personal portfolio. The code structure is MIT-licensed. Content, images, and case study text are © Ari Zilnik.
