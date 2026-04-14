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

### The 7 Case Studies

The portfolio features 7 deep case studies across three employers plus a side project.
Each tells a different story about Ari's capabilities:

| # | Project | Story Arc | Key Signal |
|---|---------|-----------|------------|
| 1 | **Join Ideas** | Research pivot, AI feature, $500K savings in 30 days | AI product design, research rigor, business impact |
| 2 | **Join Scenarios** | Decisions-in-sets reframe, 50% cycle reduction, architect audience surprise | Decision-support UX, non-ranked comparison craft |
| 3 | **Join Navigation** | Project-first mental-model rebuild, 32% support ticket drop | Research-driven mental-model work, AI-coded prototypes |
| 4 | **Blockdaemon Staking & API** | Founding designer, 0-to-1 product, 23x usage, team of 7 | Zero-to-one leadership, fintech, scaling |
| 5 | **Blockdaemon Nodes Checkout** | Purchase-metaphor reframe, 23x usage, sole designer in 4 months | Mental-model design, founding designer scope |
| 6 | **Gradle Enterprise Filtering** | Replaced scattered dropdowns with a pattern-scale omnibar | Progressive complexity, cross-team pattern adoption |
| 7 | **ha-smart-hood-vent** | Air quality problem, rate-of-change insight, open source | Systems thinking, builder mindset, end-to-end execution |

### Side Projects Section

A lighter-format section showcasing builder projects (resume-builder AI pipeline, etc.)
with brief descriptions, screenshots, tech stack tags, and GitHub links. Not full case
studies; evidence of builder DNA.

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

Available for use in case study `.mdx` files. Visual chrome components
(`FullBleedImage`, `FullBleedGif`, `VideoPlayer`, `ImageGrid`) display
media. Structure components (`MetaCards`, `PivotCard`, `Impact`,
`Lessons`, `Callout`) carry the narrative and take structured props
for automation-friendly content.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `FullBleedImage` | Viewport-width optimized image (CSS breakout) | `src` (ImageMetadata), `alt`, `caption?` |
| `FullBleedGif` | Viewport-width animated GIF | `src` (string path to public/), `alt`, `caption?` |
| `VideoPlayer` | Autoplay muted looping video with GIF fallback | `src`, `fallback`, `alt`, `caption?` |
| `ImageGrid` | 2-3 images side-by-side, responsive | `images` (array of {src, alt}), `caption?` |
| `Callout` | Accent-bordered insight box | `label?` (uppercase header), children via slot |
| `MetaCards` | Row of labeled mini-cards for role/company/timeline at the top of a case study | `cards` (array of `{ label, value, note }`) |
| `PivotCard` | One dedicated highlighted block for the case study's pivot moment. Structured as summary + cause + result | `summary`, `cause`, `result` |
| `Impact` | Concise per-section impact statement. Drop one under each major heading so impact is interleaved throughout the body | `label?` (defaults to "Impact"), children via slot |
| `Lessons` | Numbered list of 3 actionable lessons. Sits near the end of the body | `lessons` (array of 3 strings), `heading?` |

**Preferred components for the product-narrative style:** `FullBleedImage`,
`FullBleedGif`, `VideoPlayer`, `ImageGrid`, `PressQuote`, `Credits`. These
keep the focus on the product. Use `Callout` sparingly for a single
pivotal insight. Avoid `PivotCard`, `Impact`, `Lessons`, and `MetaCards`
in new case studies — they pull the reader into process narration.

## Converting Screen Recordings to Video

```bash
./scripts/convert-video.sh input.mov my-recording
# Produces: public/videos/my-recording.mp4 and public/videos/my-recording.gif
```

Requires FFmpeg: `brew install ffmpeg`

---

## Content Quality System

The portfolio has a reusable, agent-driven system for writing and auditing
case studies. Use it for every new case study and every meaningful revision.

### Single source of truth for voice

Voice rules, banned words, code contribution framing, canonical project facts,
and the mechanical scan all live in a single shared file that both the
resume-builder and the portfolio read:

**`../resume-builder/voice/portfolio-voice.md`** — canonical voice rules.

When the rules here disagree with that file, the shared file wins. Update
both together when voice rules change.

### The 2026 POV library

**`.claude/pov/portfolio-pov-2026.md`** — 34 cited sources on what works
in senior/staff/principal portfolios in 2026. Includes direct quotes from
Polly D'Arcy (Wealthsimple), Carl Rivera (Shopify), Katie Dill (Stripe),
Hannah Hearth (Vercel), and others. Agents cite this file when proposing
changes. Refresh quarterly.

### The 6 content agents

All live in `.claude/agents/` and are symlinked to `.opencode/agents/` for
OpenCode compatibility.

| Agent | Purpose |
|---|---|
| `case-study-interviewer.md` | Conversational Q&A to gather canonical facts. Surfaces gaps first, sweeps the template arc, writes dated notes to `.claude/interviews/`. Proposes diffs for `interview-context.md`. |
| `case-study-writer.md` | Drafts the MDX case study from verified interview notes. Reuses existing imports. Inserts `[VISUAL: ...]` placeholders for the visual critic. |
| `mechanical-scan.md` | Deterministic 12-check scan (em-dashes, banned words, triplets, tense jumps, thematic echoes, unverified facts). Runs first on every draft and every revision. Caps score at 7 on any violation. |
| `writing-style-audit.md` | Subjective audit across 7 dimensions (AI detection, voice match, business impact lead, conciseness, simplicity, scar authenticity, code contribution framing). |
| `visual-critic.md` | Inventories visuals, calculates density, proposes P0/P1/P2 visuals with rationale grounded in the POV library. Never mocks up visuals. |
| `ten-second-test.md` | Simulates the 10-second hiring-manager scan, then runs vibe check through named panelists (Polly, Carl, role-specific HM). |

### The 2 slash commands

Both in `.claude/commands/` with symlinks from `.opencode/commands/`.

- **`/new-case-study {slug}`** — Full pipeline: interview → writer →
  mechanical scan → style audit → visual critic → 10-second test → build.
  Supports `--rewrite`, `--new`, `--from-draft`, `--skip-vibe`.
- **`/revise-case-study {slug}`** — Lighter revision pipeline. Skips the
  interview unless canonical gaps are detected. Supports `--scan-only`,
  `--audit-only`, `--visual-only`, `--no-interview`.

### The case study template

**`.claude/templates/case-study-template.mdx`** — canonical structure with
inline guidance and a writer self-check. Copy it into
`src/content/work/{slug}.mdx` when starting a new case study.

### Ship thresholds

Every case study must meet all of these to ship:

- Mechanical scan: **PASS**
- Writing Style Audit: **≥ 8/10**
- 10-second test: **≥ 8/10**
- Vibe check: **at least 2 of 3 panelists ≥ 8/10**
- Visual critic: **all P0 visuals resolved or explicitly waived**
- `npm run build`: **clean**

---

## Writing Guidelines (summary)

The full rules live in `../resume-builder/voice/portfolio-voice.md`. This
section is a pointer, not a duplicate. Read the shared file before writing
any portfolio copy.

### Voice in one paragraph

First person, active voice, paragraph style. Plain language and concrete
analogies ("Like AWS for crypto"). Confident but not breathless. Specific
over vague. Varied sentence rhythm. Show the hard parts. Warmth scales by
surface: resume tightest, cover letter warmer, portfolio prose warmer
still, about page warmest.

### Lead with impact

Every case study title leads with the business outcome. The description
adds context the title doesn't already carry — never retells the same
story. Pyramid principle throughout.

- GOOD title: "An AI recommendation engine that saved a construction
  customer $500K in 30 days"
- BAD title: "Join Ideas: A Case Study in AI-Powered Design"
- GOOD description: "Customer research killed the marketplace direction.
  Shipped in 2 months."
- BAD description: "I pivoted a materials marketplace into an AI
  recommendation engine after customer research killed the original
  direction. One enterprise customer saved $500K in month one."

### Code contribution framing (critical — never drift)

**Design is the primary skill. Always.** Never "designer who also codes"
or "full-stack designer." Always "AI-coded prototypes to derisk decisions"
or equivalent. Full rules in the shared voice file section 5.

### Banned words (partial list — full list in shared file)

delve, leverage, utilize, facilitate, spearhead, synergy, streamline (vague),
holistic, robust, scalable (non-technical), innovative (self-applied),
seamless, unlock, proven track record, detail-oriented, results-driven,
self-starter, team player, passionate, thought leader.

### Structural bans

- No em-dashes (`—` U+2014). Literal character scan before ship.
- No triplets of adjectives or parallel noun constructions.
- No 4+ item inline lists.
- No calling work "complex" — frame as simplifying complexity.
- No arrow characters in prose.
- No tense jumps within a paragraph.
- No time-relative phrases ("yesterday," "last week") without a calibration
  warning.

### Framing for senior/player-coach roles

1. **Business value** — Revenue, retention, efficiency gains with hard
   numbers.
2. **Strategic thinking** — Why this problem mattered, what constraints
   shaped the approach, what you chose NOT to build and why.
3. **Leadership through influence** — Organizational change, team
   development, specific cross-functional stakeholders.
4. **Ownership of outcomes** — Shepherded from research through
   post-launch impact.
5. **Executive-ready storytelling** — Scannable, pyramid principle, key
   metrics visually prominent.

These signals are woven into the product narrative, not isolated into
their own sections. "What I chose not to build" is one sentence in the
intro, not its own heading. Leadership shows through the Credits
component and how collaborators are named, not a "Leadership" section.

### Design philosophy (weave in, don't list)

1. Business-first mindset — cares about making great things, not titles.
2. Servant leader — leads by example, stays close to the work.
3. Thrives in ambiguity — 0-to-1 is the energy zone.
4. Design superpower — simplifying the overwhelming.
5. Constant learner — picks up new tools and domains.

---

## Case Study Structure: Product Narrative (not Process Narrative)

Case studies read like **product tours with judgment**, not design-process
documentaries. The reader should understand the product and its impact first;
process details earn their place only when they reveal a decision that shaped
the product.

This pattern is modeled on the portfolios Ari benchmarks against: Ainara Sainz,
Danny Williams, Sophie Qi, Jason Au, Tyler Kotsopoulos, and others in his
competitive set (listed in `.claude/pov/portfolio-pov-2026.md`). The shared
trait: sections named after product features, not process steps.

### The anti-pattern (do NOT write this way)

- Sections called "Research", "Ideation", "Design exploration", "What I chose
  not to build", "Reflection"
- Multi-paragraph narratives about running interviews, bringing findings to
  stakeholders, and pivoting
- Introspective paragraphs about what you'd do differently
- PivotCard components that dramatize the research-to-pivot arc
- "Designing for X" section headers that frame the story around the designer's
  internal challenge rather than the product

### The pattern (write this way)

**Intro (3 short paragraphs max, no heading):**
1. What the company is — one plain-language sentence
2. What the product/feature does and what user problem it solves
3. Origin compressed to one sentence if there was a pivot or unusual backstory

**Body (sections named after product features or capabilities):**
- Each `##` heading names a concrete product element: "Suggestion carousels",
  "Human review layer", "Forced comparison", "Staking 2.0", "Marketplace"
- Each section: 1-2 short paragraphs of explanation, then a `FullBleedImage`
- The ratio should feel ~60% visual, ~40% text
- Process details (research, prototyping, stakeholder alignment) are woven
  into feature sections as 1-2 sentences, not broken into their own sections
- Judgment shows through what the product *is*, not through narrating the
  journey to get there

**Results (short):**
- Hard metrics as direct statements: "One customer saved $500K in 30 days."
- No reflective framing ("That wasn't a projection..."). Just the facts.
- Press quotes if available

**Credits:**
- Named collaborators with LinkedIn links via `<Credits>` component

### What's NOT in a case study

- No "Reflection" section. None of the competitive-set portfolios have one.
- No "What I chose not to build" section. Compress to one sentence in the
  intro if it shaped the product direction.
- No research-journey narratives. The pivot or insight gets one sentence.
- No PivotCard component. The pivot lives in the intro paragraph.
- No Lessons component. The product speaks for itself.

### Frontmatter description

The `description` field renders as a pull paragraph on the case study page
AND as card text on the homepage. Keep it to one punchy sentence, two max.
It should add information the title doesn't already carry. Never retell the
same story the title tells.

- GOOD: "Customer research killed the marketplace direction. Shipped in 2 months."
- BAD: "I pivoted a materials marketplace into an AI recommendation engine
  after customer research killed the original direction. One enterprise
  customer saved $500K in month one."

### Homepage copy principles

The homepage follows the same "less is more" rule. Confidence subtracts.

- **Hero bio:** One sentence of positioning, no personality line. The work
  below it carries the weight. No employer name-dropping, no credibility
  stacking (valuation numbers, investor names, press links). Those details
  belong in case studies.
- **Case study cards:** Title leads with outcome. Description is ≤2 short
  sentences that add context the title doesn't cover. Never repeat the
  metric from the title in the description.
- **Meta description:** Matches the tightened tone. Not a keyword dump.

### Reference portfolios (competitive set)

When in doubt about tone, density, or structure, check these:

| Name | URL | Why they're a reference |
|------|-----|----------------------|
| Ainara Sainz | ainarasainz.com | Feature-named sections, short prose, big images, credits with real names |
| Danny Williams | dannyjpwilliams.com | Minimal homepage, experience list, no over-explanation |
| Sophie Qi | sophieqi.com | Card descriptions that earn the click without retelling the title |
| Jason Au | aujason.com | Product-framed case study descriptions at every level |
| Tyler Kotsopoulos | tylerkotsopoulos.ca | Clean homepage, company name + image, nothing else needed |
| Alex Taylor Smith | alextaylorsmith.com | One paragraph bio, "case studies available on request" confidence |

The pattern across all of them: **senior designers let the work talk.
Junior designers narrate over it.**

---

## Theme System

The site uses 2 themes:

1. **`dark-editorial`** (default) — Dark gray with gold accents, Newsreader headings.
   Sophisticated and editorial. This is what first-time visitors see.
2. **`gradient-editorial`** — Pastel mesh gradient background, Space Grotesk headings.
   Distinctive light-mode alternative.

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
