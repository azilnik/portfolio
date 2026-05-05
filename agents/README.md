# Portfolio Testing Agents

Scaffolding for testing pieces of the ari.design portfolio — adapted from the resume-builder agent system. Each agent is a persona definition that Claude can load when invoked. The shape mirrors `resume-builder/agents/`, so the workflow is familiar.

## Agents

| Agent | What it tests | Output |
|---|---|---|
| [ai-detector](./ai-detector.md) | Empirical AI-writing detection on case study prose via Pangram Labs v3 | `analysis/{slug}/ai-detection-report.md` |
| [writing-style](./writing-style.md) | Voice, AI tells, banned phrases, voice drift across the portfolio | `analysis/{slug}/writing-style-report.md` |
| [seo-audit](./seo-audit.md) | Adherence to `docs/SEO.md` rules — titles, descriptions, meta, JSON-LD, sitemap | `analysis/{slug}/seo-audit-report.md` |
| [accessibility-audit](./accessibility-audit.md) | WCAG 2.1 AA — alt text, semantic HTML, keyboard, contrast, motion | `analysis/{slug}/accessibility-report.md` |
| [case-study-reviewer](./case-study-reviewer.md) | Narrative, hook, evidence, structure — the hiring-manager read | `analysis/{slug}/case-study-review.md` |

## Scripts

| Script | What it does |
|---|---|
| `npm run ai-detect` | Submits every case study's prose to Pangram. Writes per-slug raw JSON + markdown report. Requires `PANGRAM_API_KEY`. |
| `npm run ai-detect -- --slug join-scenarios` | Scans one case study. |
| `npm run seo-check` | Programmatic frontmatter check — missing fields, length issues, banned phrases. Exits 1 on errors. |
| `npm run seo-check -- --slug join-scenarios` | Checks one case study. |

## Standard workflow for a new or revised case study

1. **Write or edit** `src/content/work/{slug}.mdx`.
2. **Writing Style** agent — voice/AI-tells pass. Iterate until 8/10+. Output to `analysis/{slug}/writing-style-report.md`.
3. **AI Detector** agent — `npm run ai-detect -- --slug {slug}`. One pass, corroboration-only rewrites. Output to `analysis/{slug}/ai-detection-report.md`.
4. **SEO Audit** agent — `npm run seo-check -- --slug {slug}` then manual checks per `agents/seo-audit.md`.
5. **Accessibility Audit** agent — manual + Lighthouse. Verdict must be PASS to ship.
6. **Case Study Reviewer** agent — narrative critique. Iterate prose if score < 8.
7. **Build:** `npm run build` — confirm Zod passes, sitemap correct, OG card renders.

Steps 2 and 3 form a loop — writing-style agent may iterate; ai-detector runs once at the end. Steps 4-6 can run in any order after the prose is stable.

## Reports directory

All agent outputs land in `analysis/{slug}/` (gitignored). Reports are auto-versioned (`-v2.md`, `-v3.md`) on subsequent runs — never overwritten.

## Environment

`PANGRAM_API_KEY` lives in `.env` (gitignored). Copy `.env.example` and fill in. Without the key, `npm run ai-detect` skips gracefully (exit 0). Sign up at https://www.pangram.com.

## Why this exists

The portfolio used to be checked manually after every edit, which meant SEO regressions and AI-tell drift were caught late. The agent system catches them at write time:

- **Writing Style + AI Detector** are the two-layer defense against AI-sounding prose. The pattern matcher catches what classifiers miss; the classifier catches what pattern matching misses. Don't run one without the other.
- **SEO Audit** prevents the most common silent regressions (forgotten `seoTitle`, drift in voice, broken sitemap).
- **Accessibility Audit** is the bar. WCAG 2.1 AA isn't optional — Ari already added a skip-link this month; future case studies need to keep that quality.
- **Case Study Reviewer** is the strategic check — does this piece actually do work for Ari's positioning, or is it just project documentation?
