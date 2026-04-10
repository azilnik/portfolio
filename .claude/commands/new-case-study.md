---
description: Full pipeline for drafting a new portfolio case study from an interview through ship-ready MDX. Runs the interviewer, writer, mechanical scan, style audit, visual critic, and 10-second test with iteration loops.
---

# /new-case-study

End-to-end pipeline for producing a ship-ready portfolio case study for Ari
Zilnik. Runs the six content agents in sequence, with checkpoints for human
input at the key decision points, and targets an 8/10 ship threshold on
every subjective score plus a PASS on the mechanical scan.

## Usage

```
/new-case-study {slug}
```

Where `{slug}` is a kebab-case identifier like `join-ideas`,
`blockdaemon-staking-and-api`, or `ha-smart-hood-vent`.

Optional modifiers:

- `--rewrite` — The case study exists. Treat the current MDX as the v0 to
  replace. Default when the file exists.
- `--new` — The case study doesn't exist yet. Skip the "read existing"
  step in the interviewer.
- `--from-draft` — Skip the interview. Assumes interview notes already
  exist at `.claude/interviews/{slug}-{latest}.md`. Starts from the
  writer step.
- `--skip-vibe` — Skip the final 10-second + vibe check pass. Only use
  during rapid iteration; never skip for ship.

## Pipeline

### Step 1 — Pre-flight

Read these files to ground the session:

1. `CLAUDE.md` — portfolio content strategy, MDX components, target
   audience.
2. `../resume-builder/voice/portfolio-voice.md` — shared voice rules.
3. `../resume-builder/resumes/base.yaml` — canonical career data.
4. `../resume-builder/resumes/interview-context.md` — deep career
   context.
5. `.claude/pov/portfolio-pov-2026.md` — 2026 industry POV.

Confirm the target slug and show Ari what step is about to run.

### Step 2 — Interview (skippable with `--from-draft`)

Launch the **Case Study Interviewer** agent (see
`.claude/agents/case-study-interviewer.md`).

Workflow:

1. Build the gap inventory (facts in current MDX not sourced in
   canonical data; missing template sections; missing writer inputs).
2. Walk Ari through the gap inventory first. Resolve unsourced facts
   or confirm that they can be softened / dropped.
3. Sweep the case study template arc (context → challenge → process
   → solution → impact → leadership → reflection) with conversational
   Q&A.
4. Build the visual & artifact inventory.
5. Write dated notes to `.claude/interviews/{slug}-{YYYY-MM-DD}.md`.
6. Propose a diff for
   `../resume-builder/resumes/interview-context.md` and
   `../resume-builder/resumes/base.yaml` if the interview surfaced
   canonical corrections. **Do not apply the diff silently — show Ari
   and confirm.**

**Checkpoint:** Ari approves the interview notes and the canonical data
diff. Apply the diff to the resume-builder files.

### Step 3 — Writer

Launch the **Case Study Writer** agent (see
`.claude/agents/case-study-writer.md`).

Workflow:

1. Read the interview notes and all the pre-flight files.
2. Produce a one-page plan (hiring-manager argument, story arc,
   metrics, lede, scars, AI fluency angle, visual placeholders, voice
   quotes to reuse verbatim).
3. Draft `src/content/work/{slug}.mdx`, reusing existing imports
   where possible and inserting `[VISUAL: ...]` placeholders where
   new visuals are needed.
4. Write the writer report to
   `.claude/reports/{slug}/writer-report.md`. If a previous report
   exists, write to `writer-report-v2.md`, etc.
5. Run the writer's own mechanical-scan self-check and address any
   violations before handing off.

**Checkpoint:** Ari can review the draft before downstream agents run
(optional — set `--auto` to skip).

### Step 4 — Mechanical Scan

Launch the **Mechanical Scan** agent (see
`.claude/agents/mechanical-scan.md`).

Workflow:

1. Run all 12 checks from `portfolio-voice.md` section 7 against the
   draft.
2. Write results to
   `.claude/reports/{slug}/mechanical-scan-{version}.md`.
3. Set score cap: PASS = no cap, FAIL = cap at 7.

**Gate:** If PASS, continue. If FAIL, **do not proceed to subjective
agents.** Send the draft back to the writer with the scan report,
increment the version to v2, and re-run from Step 3. Max 3 iterations.

### Step 5 — Writing Style Audit

Launch the **Writing Style Audit** agent (see
`.claude/agents/writing-style-audit.md`).

Workflow:

1. Read the mechanical scan report and honor the score cap.
2. Score across 7 dimensions (AI detection, voice match, business
   impact lead, conciseness, simplicity, scar authenticity, code
   contribution framing).
3. Write to `.claude/reports/{slug}/style-audit-{version}.md`.

**Gate:** If overall score ≥ 8, continue. If 7 or lower, send back to
the writer with the specific fixes, re-run the mechanical scan, and
loop. Max 3 iterations.

### Step 6 — Visual Critic

Launch the **Visual Critic** agent (see
`.claude/agents/visual-critic.md`).

Workflow:

1. Inventory current visuals, calculate density, identify gaps.
2. Propose P0/P1/P2 visuals with rationale, component, placement,
   priority, and effort.
3. Write to `.claude/reports/{slug}/visual-spec-{version}.md`.

**Checkpoint:** Ari reviews the visual spec and decides which P0s to
produce before ship. P0s are ship-blockers; P1s and P2s are tracked
but not required.

**Gate:** If any P0 is unresolved, either (a) produce the visual, (b)
resolve it with an existing asset, or (c) escalate to Ari with a
rationale for shipping without it. Ship is blocked until all P0s are
either produced or explicitly waived.

### Step 7 — 10-Second Test + Vibe Check

Launch the **Ten-Second Test + Vibe Check** agent (see
`.claude/agents/ten-second-test.md`).

Workflow:

1. Run the 10-second scan against only the scannable elements.
2. Score 6 scan dimensions.
3. Vibe check through Polly D'Arcy, Carl Rivera, and one
   role-specific HM.
4. Write to `.claude/reports/{slug}/ten-second-test-{version}.md`.

**Gate:**
- 10-second overall ≥ 8
- At least 2 of 3 vibe panelists ≥ 8
- Mechanical scan PASS
- Style audit ≥ 8
- All P0 visuals resolved

If any gate fails, route back to the appropriate earlier step:
- 10-second fails → writer (title, lede, metrics, headings)
- Vibe fails → writer (voice, framing, panelist-specific language)
- Visual gate fails → visual critic + Ari

Max 3 iterations through the full loop.

### Step 8 — Build verification

Run `npm run build` to confirm:

- Content collection schema validates.
- All image imports resolve.
- MDX compiles cleanly.
- No broken component references.

If the build fails, fix the specific errors and re-run from Step 4.

### Step 9 — Ship checklist

Before declaring the case study done, confirm:

- [ ] Mechanical scan PASS
- [ ] Writing Style Audit ≥ 8/10
- [ ] 10-second test ≥ 8/10
- [ ] At least 2 of 3 vibe panelists ≥ 8/10
- [ ] All P0 visuals resolved or explicitly waived
- [ ] `npm run build` clean
- [ ] Canonical data diffs applied to resume-builder
- [ ] Writer report, scan report, style audit, visual spec, and
      vibe check report all saved under `.claude/reports/{slug}/`
- [ ] No `[UNVERIFIED]` tags in the final MDX
- [ ] No draft notes or `[VISUAL: ...]` placeholders left in the MDX
      body

## Iteration rules

- **Max 3 iterations per agent** before escalating to Ari. If the
  writer draft is still failing after v3, the issue is probably in the
  interview notes or the canonical facts — go back to the interviewer.
- **Versioned reports never overwrite.** Every report file is saved
  with a version suffix so the iteration history is visible.
- **Upstream re-checks mandatory after downstream changes.** Any edit
  to the MDX after the mechanical scan requires a new mechanical
  scan. Don't assume the v1 scan carries over to v2.
- **Human checkpoints at key decision points** rather than full
  autonomy. The interview → canonical diff, writer draft review, and
  visual P0 decisions are the mandatory checkpoints.

## Skip rules

- Never skip the mechanical scan.
- Never skip the fact verification (no `[UNVERIFIED]` tags in ship
  version).
- `--skip-vibe` may be used during iteration but never at ship.
- `--from-draft` may be used when the interview already happened in a
  prior session.

## Related files

- Agents: `.claude/agents/*.md`
- Voice rules: `../resume-builder/voice/portfolio-voice.md`
- POV library: `.claude/pov/portfolio-pov-2026.md`
- Case study template: `.claude/templates/case-study-template.mdx`
- Canonical data: `../resume-builder/resumes/base.yaml` and
  `../resume-builder/resumes/interview-context.md`
- Portfolio content strategy: `CLAUDE.md`
