---
description: Lighter revision pipeline for an existing case study. Skips the full interview unless the quality agents detect canonical gaps. Runs mechanical scan, style audit, visual critic, and 10-second test against the current MDX and proposes targeted revisions.
---

# /revise-case-study

Revision pipeline for a case study that already exists. Use this when a
case study is in the repo and needs quality improvements but not a full
re-interview. If the quality agents detect canonical data gaps or missing
writer inputs, the pipeline will escalate back to the interviewer.

For full rewrites, use `/new-case-study {slug} --rewrite` instead.

## Usage

```
/revise-case-study {slug}
```

Optional modifiers:

- `--scan-only` — Run only the mechanical scan. Useful for a quick check.
- `--audit-only` — Run the mechanical scan and writing style audit only.
  Skip visual critic and 10-second test.
- `--visual-only` — Run only the visual critic.
- `--no-interview` — Never escalate back to the interviewer, even if
  canonical gaps are detected. Use at your own risk.

## Pipeline

### Step 1 — Pre-flight

Read:

1. `CLAUDE.md`
2. `../resume-builder/voice/portfolio-voice.md`
3. `../resume-builder/resumes/base.yaml`
4. `../resume-builder/resumes/interview-context.md`
5. `.claude/pov/portfolio-pov-2026.md`
6. `src/content/work/{slug}.mdx` — the current version.
7. Any prior reports in `.claude/reports/{slug}/` for context.
8. Any prior interview notes in `.claude/interviews/{slug}-*.md`.

### Step 2 — Mechanical Scan (always first)

Run the **Mechanical Scan** agent against the current MDX. Write to
`.claude/reports/{slug}/mechanical-scan-{version}.md`.

If `--scan-only`, stop here.

### Step 3 — Writing Style Audit

Run the **Writing Style Audit** agent. Score 7 dimensions and propose
specific rewrites for paragraphs with 3+ flags.

**Gap detection:** If the audit flags unsourced facts, missing AI
fluency angle, missing scar, or other canonical gaps that can't be
closed from existing interview notes, escalate: stop the revision
pipeline and recommend running `/new-case-study {slug} --rewrite` to
re-interview. Unless `--no-interview`, do not continue.

If `--audit-only`, stop here.

### Step 4 — Visual Critic

Run the **Visual Critic** agent. Inventory, density check, gap
analysis, proposed visuals.

If `--visual-only`, stop here.

### Step 5 — 10-Second Test + Vibe Check

Run the **10-Second Test + Vibe Check** agent. Simulate the scan,
run the vibe check through Polly, Carl, and one role-specific HM.

### Step 6 — Apply revisions

For each flagged issue, propose the revision inline and either:

- **Auto-apply** if the fix is unambiguous (e.g., removing an em-dash,
  fixing a tense jump, cleaning a dead import).
- **Propose to Ari** if the fix is judgment-based (e.g., rewriting a
  paragraph, changing a metric, relabeling a section).

After any edit, re-run the mechanical scan to confirm no new
violations were introduced.

### Step 7 — Build verification

`npm run build` must be clean.

### Step 8 — Ship checklist

Same as `/new-case-study` step 9.

## When to use /revise-case-study vs /new-case-study

| Scenario | Command |
|---|---|
| Case study has canonical data gaps that need Ari's input | `/new-case-study {slug} --rewrite` |
| Case study has mechanical scan failures | `/revise-case-study {slug}` |
| Case study has style issues but facts are solid | `/revise-case-study {slug}` |
| Case study is visually thin but prose is fine | `/revise-case-study {slug} --visual-only` |
| New case study, no prior version | `/new-case-study {slug} --new` |
| Just checking for banned words / em-dashes | `/revise-case-study {slug} --scan-only` |

## Rules

- Never skip the mechanical scan.
- Escalate to interview when canonical gaps are detected, unless
  `--no-interview` is set.
- Apply fixes in the smallest viable unit — don't rewrite paragraphs
  that only need a word change.
- Re-run the mechanical scan after every edit.
- Max 3 iterations through the full loop.

## Related files

Same as `/new-case-study`.
