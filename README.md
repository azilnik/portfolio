# ari.design

Personal portfolio site for Ari Zilnik — designer building products at the intersection of design systems, developer tools, and complex workflows.

**Live at** [ari.design](https://ari.design)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Astro 5](https://astro.build) | Static site generator with file-based routing |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS via the `@tailwindcss/vite` plugin |
| [MDX](https://mdxjs.com) | Markdown + components for case study content |
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
│   └── mdx/                # FullBleedImage, VideoPlayer, ImageGrid, Callout
├── content/
│   ├── work/               # Case study .mdx files (one per project)
│   │   └── images/         # Case study images
│   └── testimonials/       # testimonials.json
├── data/                   # TypeScript data (employers.ts, navigation.ts)
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
└── convert-video.sh        # FFmpeg: screen recording → mp4 + gif
```

## Adding a Case Study

Case studies are MDX files in `src/content/work/`. Each file's frontmatter is validated against a Zod schema at build time — missing or invalid fields will throw a clear error.

### 1. Create the file

```bash
touch src/content/work/my-project.mdx
```

### 2. Add frontmatter

```yaml
---
title: "Project Title"
company: "Company Name"
role: "Your Role"
industry: "Industry"
description: "One-line description for SEO and card previews."
heroImage: "./images/my-project-hero.jpg"
thumbnail: "./images/my-project-thumb.jpg"
thumbnailAlt: "Alt text for the thumbnail"
employer: "join"          # "join" | "blockdaemon" | "gradle" | "freelance"
sortOrder: 1              # Lower numbers appear first
draft: false              # Set true to hide from production
metrics:                  # 1–3 impact metrics (optional)
  - label: "Metric Name"
    value: "+25%"
---
```

### 3. Write content with MDX components

```mdx
import FullBleedImage from "../../components/mdx/FullBleedImage.astro";
import VideoPlayer from "../../components/mdx/VideoPlayer.astro";
import ImageGrid from "../../components/mdx/ImageGrid.astro";
import Callout from "../../components/mdx/Callout.astro";

## The Challenge

Regular markdown works here — paragraphs, headings, lists, links, etc.

<FullBleedImage src={heroImg} alt="Full-width screenshot" />

<Callout label="Key Insight">
  Callouts highlight important takeaways.
</Callout>

<ImageGrid images={[img1, img2, img3]} alt="Side-by-side comparison" />

<VideoPlayer src="/videos/my-recording" caption="Prototype walkthrough" />
```

The page auto-generates at `/work/my-project`.

## MDX Components

| Component | Purpose |
|-----------|---------|
| `FullBleedImage` | Breaks out of the prose container to span the full viewport width |
| `VideoPlayer` | Autoplay/muted/looping `<video>` with a GIF fallback for older browsers |
| `ImageGrid` | 2–3 images side-by-side, responsive (stacks on mobile) |
| `Callout` | Highlighted aside with accent border and optional label |

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

To point `ari.design` at GitHub Pages:

1. Add a `CNAME` record for `ari.design` pointing to `azilnik.github.io`
2. Create `public/CNAME` containing `ari.design`
3. Push — GitHub will pick up the custom domain automatically

## License

This is a personal portfolio. The code structure is MIT-licensed. Content, images, and case study text are © Ari Zilnik.
