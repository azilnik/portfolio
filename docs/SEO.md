# ari.design — SEO, voice, and content rules

Living governance doc for the portfolio. The rules below are load-bearing — titles, descriptions, structured data, and tracking all reference the same voice and the same pattern. Adding a new case study without checking this file will silently regress the SEO work.

Ari keeps a local `CLAUDE.md` at the repo root that auto-loads when Claude sessions start in this repo (it's gitignored — see `.gitignore` line 30). If that CLAUDE.md exists, it should either mirror this file or point at it so future Claude sessions get these rules automatically.

---

## Voice

**Non-negotiables:**

- First-person on the page body ("I lead design teams"). Third-person in meta descriptions ("Ari Zilnik — Head of Design at Join").
- No corporate verbs: **no** "crafting", "empowering", "leveraging", "unlocking", "delivering".
- No ampersand as connector in titles ("Design & Product Designer" → bad). An ampersand inside a proper noun is fine ("Staking & API").
- No redundant design-nouns. "Head of Design & Product Designer" doubles the concept — drop one.
- Sentence case where the body uses it ("design leader"). Title Case where an industry title is being quoted ("Head of Design").
- Dry humor and distinctive details ("six record players", "over-engineered home automation", "236 lines of YAML") are in-voice AND SERP-valuable. Keep them.
- Descriptions in case study frontmatter are half-sentence taglines — they're the card subtitle and the lede paragraph on the page. They are **not** the meta description. `seoDescription` carries that.

**Tone calibration:** Ari's voice is direct, outcome-first, lightly dry. It's not neutral. Generic LinkedIn phrasing ("thoughtful digital experiences") is always wrong.

---

## Titles

**Pattern:** `{specific thing} — Ari Zilnik`

- `{specific thing}` should tell you what page you're on from the SERP alone.
- Target ≤50 chars for the prefix, ≤60 chars total including the brand suffix.
- `BaseLayout.astro` auto-appends " — Ari Zilnik" unless the passed title already contains "Ari Zilnik". So pages that need a non-standard format (homepage, about with geo signal) can pass the full title.

**Case studies use the feature-at-company variant:** `{feature} at {company}` (e.g., "Scenarios at Join", "Nodes Checkout at Blockdaemon"). Side projects drop the "at company" and describe the thing ("A smart hood vent for Home Assistant").

**Current titles (last audited 2026-04-14):**

| Route | Title |
|-------|-------|
| `/` | `Ari Zilnik — Head of Design at Join` |
| `/about` | `About Ari Zilnik — design leader in Toronto` |
| `/work` | `Work by Ari Zilnik — case studies` |
| `/work/join-scenarios` | `Scenarios at Join — Ari Zilnik` |
| `/work/join-navigation` | `Navigation at Join — Ari Zilnik` |
| `/work/join-ideas` | `Ideas at Join — Ari Zilnik` |
| `/work/blockdaemon-nodes-checkout` | `Nodes Checkout at Blockdaemon — Ari Zilnik` |
| `/work/blockdaemon-staking-and-api` | `Staking & API at Blockdaemon — Ari Zilnik` |
| `/work/gradle-enterprise-filtering` | `Filtering at Gradle — Ari Zilnik` |
| `/work/ha-smart-hood-vent` | `A smart hood vent for Home Assistant — Ari Zilnik` |
| `/404` | `Not found — Ari Zilnik` |

**`seoTitle` frontmatter field** (case studies only): set to the short feature-at-company form. The editorial `title` field stays long and narrative — it powers the `<h1>` on the case study page. `CaseStudyLayout` passes `seoTitle ?? \`${company} case study\`` up to `BaseLayout`, so forgetting to set `seoTitle` falls back gracefully but gives a generic SERP title.

---

## Descriptions

**Two fields per case study:**

- `description` — 8-12 word tagline. Shows up on the case study card in the /work grid and as the lede paragraph under the `<h1>`. Keep it punchy and insight-first. Taglines like "Replacing a multi-week sales cycle." are the target.
- `seoDescription` — 120-160 char meta description. This is the SEO-load-bearing copy. Third-person, keyword-dense, in-voice. Falls back to `description` if not set, but case study descriptions are too short to work as meta descriptions — always set `seoDescription` explicitly.

**Page descriptions** (non-case-study):

| Route | Description |
|-------|-------------|
| `/` | `Ari Zilnik — Head of Design at Join. Products, teams, and systems in construction, fintech, and developer tools.` |
| `/about` | `About Ari Zilnik — design leader who builds products, teams, and the occasional over-engineered home automation.` |
| `/work` | `How Ari thinks, leads, and builds. Case studies from Join, Blockdaemon, Gradle, and side projects across construction tech, fintech, and developer tools.` |
| `/404` | `The page you're looking for doesn't exist or has been moved. Browse case studies or head home.` |
| BaseLayout fallback | Same as `/`. Used when a page forgets to pass `description`. |

---

## Tracking

**GoatCounter event name convention:** `{context}-{verb}-{target}` OR `{context}-{target}` for common actions where the verb is implicit.

| Event | Where |
|-------|-------|
| `casestudy-click-{slug}` | `CaseStudyCard` (/work grid + homepage `WorkSection`) |
| `casestudy-prev-{slug}` | `CaseStudyNav` previous link |
| `casestudy-next-{slug}` | `CaseStudyNav` next link |
| `contact-{surface}` | Email CTAs (`contact-hero`, `contact-footer`, `contact-nav`, `contact-about`) |
| `linkedin-{surface}` | LinkedIn links (`linkedin-nav`, `linkedin-footer`, `linkedin-{name}`) |
| `github-footer` | GitHub link in footer |
| `about-outbound-{destination}` | External references in about body (e.g. `about-outbound-techcrunch-join`) |

New instrumentation should follow the convention so the dashboard stays groupable.

---

## Structured data (JSON-LD)

Emitted via `src/components/global/JsonLd.astro`, passed through `BaseLayout`'s `jsonLd` prop (array).

- **Home + About:** `Person` schema. Identical on both pages — Google dedupes via `sameAs`. Keep `worksFor`, `jobTitle`, `address`, and `sameAs` in sync across both when any change.
- **/work:** `BreadcrumbList` (Home → Case Studies).
- **Case studies:** `CreativeWork` + 3-level `BreadcrumbList`. Generated in `CaseStudyLayout.astro` — no per-page wiring needed.

---

## Adding a new case study

Mechanical checklist (skip any step and SEO/analytics silently regresses):

1. **Create the file** at `src/content/work/{slug}.mdx` with the frontmatter defined in `src/content.config.ts`.
2. **Set `seoTitle`** — short feature-at-company form, ≤60 chars. Don't omit — the fallback is generic.
3. **Set `description`** — 8-12 word tagline, insight-first.
4. **Set `seoDescription`** — 120-160 char meta description, third-person, in-voice, keyword-dense.
5. **Set `sortOrder`** — determines position in the grid AND the prev/next chain. Insert where intended.
6. **Set `employer`** — matches the enum in `content.config.ts` (`join | blockdaemon | gradle | freelance | side-project`). Side projects skip the homepage work grid.
7. **Confirm `heroImage` exists** — used as the page hero AND derived into a 1200×630 OG card by `CaseStudyLayout`.
8. **Confirm `thumbnail` + `thumbnailAlt`** — used on the /work grid and homepage featured card.
9. **Run `npm run build`** and verify:
   - The new URL appears in `dist/sitemap-0.xml`.
   - No Zod validation errors.
   - The rendered `<title>` uses `seoTitle`, the meta description uses `seoDescription`, and `og:image` resolves.
10. **Inspect the rendered card** to confirm `data-goatcounter-click="casestudy-click-{slug}"` is present — this is automatic via `CaseStudyCard`, but verify once per new study.

---

## Global SEO pass — run periodically

Recommended cadence: after every new case study, and quarterly regardless. Pieces drift.

- [ ] Lighthouse SEO score still 100 on every page? Most common regressor: a new page added without `description`.
- [ ] Every `<title>` unique and under 60 chars?
- [ ] Every page's `<meta name="description">` distinct, under 160 chars, in voice?
- [ ] `robots.txt` AI-bot list current? New crawlers keep appearing — e.g. `Meta-ExternalAgent`, `Applebot-Extended`, `Bytespider`. Add them explicitly as they emerge.
- [ ] `dist/sitemap-0.xml` lists every current page, nothing stale, no drafts leaked?
- [ ] `Person` JSON-LD's `worksFor`, `jobTitle`, and `address` still accurate? Changes with job moves / city moves — update both `src/pages/index.astro` AND `src/pages/about.astro` (they're duplicated by design).
- [ ] OG card renders for every page in the [OpenGraph debugger](https://www.opengraph.xyz)?
- [ ] GoatCounter dashboard shows `casestudy-click-*` firing for every case study? A newly added study with a forgotten attribute is silent.
- [ ] `public/og-default.png` and `public/apple-touch-icon.png` still present and non-broken?
- [ ] `public/CNAME` and `astro.config.mjs` `site:` still match the live domain?

---

## File map

| Concern | File(s) |
|---------|---------|
| Title logic | `src/layouts/BaseLayout.astro` (smart-append), `src/layouts/CaseStudyLayout.astro` (seoTitle composition) |
| Default description | `src/layouts/BaseLayout.astro` (fallback) |
| Case study schema | `src/content.config.ts` |
| OG image (default) | `public/og-default.png` (regenerate via `scripts/generate-og-default.mjs`) |
| OG image (case study) | Derived from `heroImage` in `CaseStudyLayout.astro` via `getImage()` |
| Structured data | `src/components/global/JsonLd.astro`, wired in `src/pages/index.astro`, `src/pages/about.astro`, `src/pages/work/index.astro`, `src/layouts/CaseStudyLayout.astro` |
| Sitemap | `@astrojs/sitemap` in `astro.config.mjs` — auto-generated at build |
| AI crawler policy | `public/robots.txt` |
| Tracking | `src/components/global/GoatCounter.astro` (the script), plus `data-goatcounter-click` attributes throughout |
| Favicon / manifest | `public/favicon.svg`, `public/favicon-32x32.png`, `public/favicon-16x16.png`, `public/apple-touch-icon.png`, `public/safari-pinned-tab.svg`, `public/site.webmanifest` |
