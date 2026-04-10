# Portfolio Site — ari.design

## Project Overview

Ari Zilnik's personal portfolio, targeting senior IC and player-coach design leadership
roles (Staff, Principal, Director) at premium product companies. Built with Astro,
Tailwind CSS v4, and MDX. Deployed to GitHub Pages at https://ari.design.

The portfolio's job is to pass the **10-second test**: a hiring manager should be able to
identify Ari's seniority level, the business problems he solves, and his impact within
seconds. Every decision — content, structure, visuals — serves that goal.

## Target Audience

Design hiring managers and recruiters at companies like Wealthsimple, Mercury, Stripe,
Notion, Linear — premium product companies that value craft, business impact, and design
leadership. The portfolio must signal:

1. **Business impact** — Metrics and outcomes, not just process
2. **Leadership + IC depth** — Player-coach who builds teams AND ships products
3. **AI fluency** — Designs AI products, builds with AI tools, upskills teams on AI
4. **Builder mindset** — Solves problems end-to-end, doesn't hide behind role boundaries

## Content Strategy

### The 3 Case Studies

The portfolio features exactly 3 deep case studies. Quality over quantity. Each tells a
different story about Ari's capabilities:

| # | Project | Story Arc | Key Signal |
|---|---------|-----------|------------|
| 1 | **Join Ideas** | Research pivot, AI feature, $500K savings in 30 days | AI product design, research rigor, business impact |
| 2 | **Blockdaemon Staking & API** | Founding designer, 0-to-1 product, 23x usage, team of 7 | Zero-to-one leadership, fintech, scaling |
| 3 | **ha-smart-hood-vent** | Air quality problem, rate-of-change insight, open source | Systems thinking, builder mindset, end-to-end execution |

### Side Projects Section

A lighter-format section showcasing builder projects (resume-builder AI pipeline, etc.)
with brief descriptions, screenshots, tech stack tags, and GitHub links. Not full case
studies — evidence of builder DNA.

### Archived Case Studies

The remaining case studies (Join Scenarios, Join Navigation, Blockdaemon Nodes Checkout,
Gradle Filtering) are set to `draft: true` and not publicly visible. They can be
reactivated if the content strategy changes.

## Content Sources (Canonical Career Data)

When writing or editing case study content, reference these canonical sources of truth
in the sibling `resume-builder` repo:

- **`../resume-builder/resumes/base.yaml`** — Canonical resume with verified metrics,
  job descriptions, and skills. All facts and numbers in case studies must match this file.
- **`../resume-builder/resumes/interview-context.md`** — Deep career context from
  interviews: project details, management history, design philosophy, AI depth,
  code contribution framing rules. Read this before writing any case study content.

If a fact appears in a case study but not in these files, verify it with Ari before
publishing.

## Tech Stack

- **Astro 5.x** — Static site generator with file-based routing
- **Tailwind CSS v4** — Utility CSS via `@tailwindcss/vite` plugin (NOT the deprecated `@astrojs/tailwind`)
- **MDX** — Markdown + JSX for case study content (embed custom components in markdown)
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
└── videos/              # Converted video files (.mp4 + .gif)
scripts/
└── convert-video.sh     # FFmpeg script: screen recording -> mp4 + gif
```

## Content Collections

Case studies use Astro Content Collections with Zod validation.
Each `.mdx` file in `src/content/work/` must include frontmatter matching the schema
in `src/content.config.ts`. A missing or invalid field will cause a build error.

The schema enforces:
- `employer` must be one of: `"join"`, `"blockdaemon"`, `"gradle"`, `"freelance"`, `"side-project"`
- `metrics` array: 1-3 items of `{ label, value }`, optional
- `draft: true` hides the case study from all listing pages

## Adding a New Case Study

1. Create `src/content/work/my-project.mdx`
2. Add frontmatter matching the schema (copy from an existing case study)
3. Add images to `src/content/work/images/`
4. Use MDX components in the body (see "MDX Components" below)
5. The page auto-generates at `/work/my-project`

## MDX Components

Available for use in case study `.mdx` files:

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `FullBleedImage` | Viewport-width optimized image (CSS breakout) | `src` (ImageMetadata), `alt`, `caption?` |
| `FullBleedGif` | Viewport-width animated GIF | `src` (string path to public/), `alt`, `caption?` |
| `VideoPlayer` | Autoplay muted looping video with GIF fallback | `src`, `fallback`, `alt`, `caption?` |
| `ImageGrid` | 2-3 images side-by-side, responsive | `images` (array of {src, alt}), `caption?` |
| `Callout` | Accent-bordered insight box | `label?` (uppercase header), children via slot |

## Converting Screen Recordings to Video

```bash
./scripts/convert-video.sh input.mov my-recording
# Produces: public/videos/my-recording.mp4 and public/videos/my-recording.gif
```

Requires FFmpeg: `brew install ffmpeg`

---

## Writing Guidelines

These rules govern all portfolio copy — case studies, homepage, about page, and metadata.
They are adapted from the resume-builder's writing style and interview context documents.

### Voice

- **First person, active voice.** "I designed..." not "Designed..." or "Was responsible for..."
- **Plain language.** "Like AWS for crypto" is the target register. Concrete analogies
  over abstract descriptions. Would a non-designer hiring manager understand this on
  first read?
- **Confident but not breathless.** State what happened without overselling. No
  exclamation points, no superlatives needed.
- **Specific over vague.** Name the thing, explain why it matters, give numbers when
  they're meaningful.
- **Varied rhythm.** Mix shorter and longer sentences. Not every sentence should be the
  same length or structure.
- **Show the hard parts.** Acknowledge tradeoffs, constraints, and things that didn't
  go as planned. Robotic positivity where everything is an achievement signals
  inexperience (or AI-generated text).

### Lead with Impact

Every case study title, TL;DR, and opening sentence should answer: "Why should a
hiring manager care?" Lead with the business outcome, not the project name or
design method.

- GOOD: "How research turned a materials marketplace into an AI tool that delivered
  $500K in construction savings in 30 days"
- BAD: "Join Ideas: A Case Study in AI-Powered Design"

### Code Contribution Framing (Critical)

**Design is the primary skill. Always.** Ari contributes to code, but this must NEVER
be framed as "designer who also codes" or "full-stack designer." That positioning
dilutes design credibility.

What code contribution signals:
- **Technical depth** — Speaks engineering's language, understands constraints
- **AI coding fluency** — Uses AI tools to build prototypes that derisk decisions
- **No-titles-as-limitations mindset** — Does whatever it takes to ship great work

How to frame:
- GOOD: "I build AI-coded prototypes to derisk library selection and validate
  technical feasibility before engineering commits resources"
- BAD: "I design and ship features full-stack, from research to production code"
- BAD: "full-stack designer"

### Banned Words & Patterns

These make text sound AI-generated or like resume filler. Flag and replace every time:

**AI-signature words:** delve, leverage, utilize, facilitate, spearhead, synergy,
optimize (vague), elevate, empower, harness, embark, navigate (metaphorical), foster,
cultivate, streamline (vague), landscape, realm, paradigm, holistic, robust, scalable
(non-technical), innovative (self-applied), cutting-edge, transformative, game-changer,
groundbreaking, seamless, unlock (potential/value), drive (impact/results — when vague)

**Resume cliches:** proven track record, detail-oriented, results-driven, self-starter,
team player, passionate (about anything), thought leader, dynamic, strategic thinker,
cross-functional synergies, wear many hats

**Structural tells:** Triplets of adjectives ("fast, reliable, and secure"), rhetorical
questions answered immediately, "Not only X, but also Y," "From X to Y" range flexes,
"At the intersection of X and Y"

**Other rules:**
- Never call work "complex" — frame it as simplifying complexity
- Don't use em-dashes in body copy — use semicolons or periods
- No arrow characters in prose

### Framing for Senior/Player-Coach Roles

The portfolio targets hybrid IC/leadership roles. Content should demonstrate:

1. **Business value** — Revenue, retention, efficiency gains with hard numbers
2. **Strategic thinking** — Why this problem mattered, what constraints shaped the
   approach, what you chose NOT to build and why
3. **Leadership through influence** — Organizational change driven, team development,
   cross-functional collaboration with specific stakeholders
4. **Ownership of outcomes** — Shepherded from research through post-launch impact,
   not just "handed off to engineering"
5. **Executive-ready storytelling** — Scannable, pyramid principle (conclusion first),
   key metrics visually prominent

### Design Philosophy (from interview context)

These are Ari's authentic values. Weave them into content naturally, don't list them:

1. **Business-first mindset.** Cares about making great things, not titles or lanes.
2. **Servant leader.** Leads by example, stays close to the work, unblocks the team.
3. **Thrives in ambiguity.** 0-to-1 is where he's most energized. Brings structure
   to undefined problems.
4. **Design superpower:** Taking something overwhelming and bringing thoughtful
   perspective to make people's lives easier.
5. **Constant learner.** Always on a learning journey. Picks up new tools and domains.

---

## Case Study Template

Each of the 3 featured case studies follows this structure. Not every section needs
equal weight — adapt to the project. But every case study must have sections 1, 2, 3,
5, and 6 at minimum.

### 1. Hero + TL;DR
- Title that leads with business outcome
- 1-2 sentence executive summary
- Key metrics displayed prominently (use the frontmatter `metrics` array)
- Metadata bar: Company, Role, Industry, Timeline

### 2. Context & Challenge
- What the company does (one plain-language sentence, like the resume style)
- What business problem existed and why it mattered
- Your specific role and who you worked with
- Constraints and strategic tensions you navigated

### 3. Process & Key Decisions
- Research methodology and what you learned
- The pivotal insight or decision point
- What you chose NOT to do and why (shows mature judgment)
- Artifacts: research synthesis, sketches, iterations, workshop outputs
- Use `Callout` components for key insights and pivot moments

### 4. Solution
- The design work itself — full-bleed images, prototypes, before/after
- Explain the "why" behind key design decisions
- Use `FullBleedImage`, `ImageGrid`, and `VideoPlayer` components

### 5. Impact & Outcomes
- Quantified results with context (not just numbers — what do they mean?)
- How you measured success
- Post-launch iterations and learnings
- Use the frontmatter `metrics` for the visual impact row

### 6. Leadership & Collaboration
- Stakeholders you influenced and how
- Team development (mentoring, upskilling, culture-building)
- Organizational change you drove
- This section is what separates senior portfolios from mid-level ones

### 7. Reflection (Optional but Recommended)
- What you'd do differently
- What you learned that changed how you work
- Signals maturity and self-awareness

---

## Theme System

The site uses 2 themes:

1. **`gradient-editorial`** (default) — Pastel mesh gradient background, Space Grotesk
   headings. Distinctive and premium.
2. **`dark-editorial`** — Dark gray with gold accents, Newsreader headings. Sophisticated
   dark mode alternative.

Theme selection persists via `localStorage` (key: `portfolio-theme`). A light/dark
toggle in the header switches between the two.

Theme tokens are defined in `src/styles/themes.css`. Each theme defines ~50 CSS custom
properties for backgrounds, text, accents, typography, spacing, and surfaces.

## Code Comments

Write comments for a novice developer. Focus on **why**, not what.

- **Explain the purpose** of decisions, not the syntax — a beginner can read `forEach`
  but not why you chose it over `map`
- **Explain non-obvious "why"s** — business logic, workarounds, tradeoffs, browser
  quirks, framework gotchas
- **Add context a newcomer would lack** — e.g. why a z-index is a specific value,
  why an event listener is passive, why a timeout exists
- **Keep comments close to the code they explain** — inline or directly above
- **Skip comments for self-evident code** — don't annotate every variable or import

## Conventions

- **Tailwind v4 theme**: Defined in `src/styles/global.css` using `@theme`, not a config file
- **Accent color**: `rgb(0, 89, 255)` — available as `var(--color-accent)`
- **Fonts**: DM Sans (headings), Inter (body), Inter Display (large display text).
  The `gradient-editorial` theme uses Space Grotesk (Google Fonts). The `dark-editorial`
  theme uses Newsreader.
- **Images**: Always use Astro's `<Image>` component for automatic optimization
- **Full-bleed images**: Use the `FullBleedImage` MDX component (CSS breakout technique)
- **Animated GIFs**: Use `FullBleedGif` with files in `public/videos/` (Sharp strips
  animation from processed images, so GIFs must bypass the image pipeline)
- **No JS frameworks**: Mobile menu, carousel, and theme toggle use vanilla JS in
  `<script>` tags with the `initX()` + `astro:after-swap` re-initialization pattern
- **GoatCounter**: Only loads when `import.meta.env.PROD` is true

## Verification

After any content or structural change, always run:

```bash
npm run build
```

A clean build with no errors confirms the content collection schemas are satisfied,
all image imports resolve, and all pages generate correctly.
