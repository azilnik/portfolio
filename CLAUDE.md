# Portfolio Site — ari.design

## Project Overview

Ari Zilnik's personal portfolio. Built with Astro, Tailwind CSS v4, and MDX.
Deployed to GitHub Pages at https://ari.design.

## Tech Stack

- **Astro 5.x** — Static site generator with file-based routing
- **Tailwind CSS v4** — Utility CSS via `@tailwindcss/vite` plugin (NOT the deprecated `@astrojs/tailwind`)
- **MDX** — Markdown + JSX for case study content (lets you embed custom components)
- **Sharp** — Automatic image optimization (WebP/AVIF, srcset, lazy loading)
- **GoatCounter** — Privacy-friendly analytics (production only)
- **GitHub Actions** — Automated deploy on push to `main`

## Key Commands

```bash
npm run dev        # Start dev server at localhost:4321 (with hot reload)
npm run build      # Production build to ./dist
npm run preview    # Preview the production build locally
```

## Project Structure

```
src/
├── assets/images/       # Images processed by Astro's <Image> component
├── components/
│   ├── global/          # Header, Footer, MobileMenu, Navigation, GoatCounter
│   ├── home/            # Hero, TestimonialCarousel, WorkSection, EmployerBlock
│   ├── work/            # CaseStudyCard (for the /work listing page)
│   ├── casestudy/       # CaseStudyHero, ImpactMetrics (case study chrome)
│   └── mdx/             # FullBleedImage, VideoPlayer, ImageGrid, Callout
├── content/
│   ├── work/            # Case study .mdx files (one per project)
│   │   └── images/      # Images referenced by case studies
│   └── testimonials/    # testimonials.json
├── data/                # TypeScript data files (employers.ts, navigation.ts)
├── layouts/             # BaseLayout > PageLayout > CaseStudyLayout
├── pages/               # File-based routing (index, work/, about, 404)
└── styles/              # global.css (Tailwind + fonts + theme)
public/
├── fonts/               # Self-hosted variable font files (.woff2)
├── videos/              # Converted video files (.mp4 + .gif)
└── CNAME                # Custom domain for GitHub Pages
scripts/
└── convert-video.sh     # FFmpeg script: screen recording → mp4 + gif
```

## Content Collections

Case studies use Astro Content Collections with Zod validation.
Each `.mdx` file in `src/content/work/` must include frontmatter matching the schema
in `src/content.config.ts`. A missing or invalid field will cause a build error.

## Adding a New Case Study

1. Create `src/content/work/my-project.mdx`
2. Add frontmatter (copy from an existing case study)
3. Add images to `src/content/work/images/`
4. Use MDX components in the body: `FullBleedImage`, `VideoPlayer`, `ImageGrid`, `Callout`
5. The page auto-generates at `/work/my-project`

## Converting Screen Recordings to Video

```bash
./scripts/convert-video.sh input.mov my-recording
# Produces: public/videos/my-recording.mp4 and public/videos/my-recording.gif
```

Requires FFmpeg: `brew install ffmpeg`

## Conventions

- **Tailwind v4 theme**: Defined in `src/styles/global.css` using `@theme`, not a config file
- **Accent color**: `rgb(0, 89, 255)` — available as `var(--color-accent)`
- **Fonts**: DM Sans (headings), Inter (body), Inter Display (large display text)
- **Images**: Always use Astro's `<Image>` component for automatic optimization
- **Full-bleed images**: Use the `FullBleedImage` MDX component (CSS breakout technique)
- **No JS frameworks**: Mobile menu and carousel use vanilla JS in `<script>` tags
- **GoatCounter**: Only loads when `import.meta.env.PROD` is true
