// AI-detection check for case study prose via Pangram Labs v3.
//
// Reads .mdx files in src/content/work/, strips frontmatter and MDX components,
// submits paragraph-level + whole-doc text to Pangram, and writes a markdown
// report + raw JSON to analysis/{slug}/.
//
// Usage:
//   npm run ai-detect                       # scan every case study
//   npm run ai-detect -- --slug join-scenarios
//   npm run ai-detect -- --file src/content/work/join-scenarios.mdx
//
// Requires PANGRAM_API_KEY in .env. Missing key → graceful skip (exit 0).

import fs from "fs";
import path from "path";

const PANGRAM_ENDPOINT =
  process.env.PANGRAM_API_URL ?? "https://text.api.pangram.com/v3";
const REQUEST_TIMEOUT_MS = 10_000;

type PangramResponse = {
  prediction?: string;
  prediction_short?: string;
  fraction_ai?: number;
  fraction_ai_assisted?: number;
  fraction_human?: number;
  num_ai_segments?: number;
  num_ai_assisted_segments?: number;
  num_human_segments?: number;
  dashboard_link?: string;
  windows?: Array<{
    text?: string;
    prediction?: string;
    ai_likelihood?: number;
  }>;
};

type Segment = {
  label: string;
  text: string;
};

type SegmentResult = Segment & {
  response?: PangramResponse;
  error?: string;
};

type CaseStudyResult = {
  slug: string;
  sourcePath: string;
  overall?: PangramResponse;
  segments: SegmentResult[];
};

// --- tiny .env loader (no dotenv dep) -------------------------------------

function loadDotenv(rootDir: string) {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

// --- args ------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.findIndex((a) => a === flag || a.startsWith(`${flag}=`));
    if (i === -1) return undefined;
    const a = args[i];
    return a.includes("=") ? a.split("=").slice(1).join("=") : args[i + 1];
  };
  return { slug: get("--slug"), file: get("--file") };
}

// --- MDX parsing -----------------------------------------------------------

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;
const IMPORT_RE = /^import\s.+from\s.+;?\s*$/gm;
const JSX_BLOCK_RE = /<([A-Z][A-Za-z0-9]*)([\s\S]*?)\/>/g;
const JSX_OPEN_CLOSE_RE = /<([A-Z][A-Za-z0-9]*)([\s\S]*?)>([\s\S]*?)<\/\1>/g;
const HEADING_RE = /^#{1,6}\s+/gm;
const BLOCKQUOTE_RE = /^>\s?/gm;
const INLINE_BOLD_RE = /\*\*(.+?)\*\*/g;
const INLINE_ITALIC_RE = /\*(.+?)\*/g;
const INLINE_LINK_RE = /\[(.+?)\]\((.+?)\)/g;

/**
 * Strips MDX-specific syntax to produce plain prose suitable for the
 * Pangram classifier. We keep the natural paragraph breaks (\n\n) so the
 * downstream paragraph splitter still works.
 */
function mdxToProse(raw: string): string {
  let body = raw.replace(FRONTMATTER_RE, "");
  // Remove import statements
  body = body.replace(IMPORT_RE, "");
  // Drop self-closing JSX components (<Image .../>, etc.)
  body = body.replace(JSX_BLOCK_RE, "");
  // Drop open/close JSX components (<Callout>...</Callout>) — keep nothing
  body = body.replace(JSX_OPEN_CLOSE_RE, "");
  // Strip markdown decorations
  body = body.replace(HEADING_RE, "");
  body = body.replace(BLOCKQUOTE_RE, "");
  body = body.replace(INLINE_BOLD_RE, "$1");
  body = body.replace(INLINE_ITALIC_RE, "$1");
  body = body.replace(INLINE_LINK_RE, "$1");
  return body.trim();
}

function paragraphSegments(prose: string): Segment[] {
  return prose
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 40) // skip short headings or stray lines
    .map((p, i) => ({
      label: `Paragraph ${i + 1}`,
      text: p,
    }));
}

// --- Pangram API -----------------------------------------------------------

async function callPangram(text: string, apiKey: string): Promise<PangramResponse> {
  const doRequest = async (): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(PANGRAM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let res: Response;
  try {
    res = await doRequest();
  } catch {
    await new Promise((r) => setTimeout(r, 2000));
    res = await doRequest();
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Pangram API ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as PangramResponse;
}

// --- scoring + report ------------------------------------------------------

function scoreFromFractionAi(fractionAi: number | undefined): number {
  if (typeof fractionAi !== "number" || Number.isNaN(fractionAi)) return 5;
  return Math.round((1 - Math.max(0, Math.min(1, fractionAi))) * 10);
}

function formatPct(n?: number): string {
  return typeof n === "number" ? `${Math.round(n * 100)}%` : "—";
}

function renderReport(doc: CaseStudyResult): string {
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push(`# AI-Detection Report: ${doc.slug}`);
  lines.push(`Date: ${date}`);
  lines.push(`Detector: Pangram Labs v3`);
  lines.push(`Source: \`${doc.sourcePath}\``);
  lines.push("");

  const score = scoreFromFractionAi(doc.overall?.fraction_ai);
  lines.push(`## Overall Score: ${score}/10`);
  lines.push("");
  lines.push(
    "> 10 = reads as fully human. 0 = reads as fully AI. The score is the document's whole-text Pangram result; per-paragraph scores are advisory."
  );
  lines.push("");

  if (doc.overall) {
    lines.push(`| Metric | Value |`);
    lines.push(`|---|---|`);
    lines.push(
      `| Prediction | ${doc.overall.prediction ?? doc.overall.prediction_short ?? "—"} |`
    );
    lines.push(`| Fraction AI | ${formatPct(doc.overall.fraction_ai)} |`);
    lines.push(`| Fraction AI-assisted | ${formatPct(doc.overall.fraction_ai_assisted)} |`);
    lines.push(`| Fraction human | ${formatPct(doc.overall.fraction_human)} |`);
    lines.push("");
  }

  if (doc.segments.length) {
    lines.push(`## Per-paragraph results`);
    lines.push("");
    lines.push(`| Paragraph | Score | Prediction | AI % | Excerpt |`);
    lines.push(`|---|---|---|---|---|`);
    for (const seg of doc.segments) {
      if (seg.error) {
        lines.push(`| ${seg.label} | — | error | — | ${seg.error} |`);
        continue;
      }
      const r = seg.response ?? {};
      const segScore = scoreFromFractionAi(r.fraction_ai);
      const excerpt = seg.text.slice(0, 80).replace(/\|/g, "\\|");
      lines.push(
        `| ${seg.label} | ${segScore}/10 | ${r.prediction_short ?? r.prediction ?? "—"} | ${formatPct(
          r.fraction_ai
        )} | ${excerpt}${seg.text.length > 80 ? "…" : ""} |`
      );
    }
    lines.push("");
  }

  const flagged = doc.segments.filter(
    (s) => s.response && scoreFromFractionAi(s.response.fraction_ai) < 7
  );
  if (flagged.length) {
    lines.push(`## Flagged paragraphs (score < 7)`);
    lines.push("");
    for (const seg of flagged) {
      const segScore = scoreFromFractionAi(seg.response!.fraction_ai);
      lines.push(`**${seg.label}** — ${segScore}/10 (${formatPct(seg.response!.fraction_ai)} AI)`);
      lines.push("");
      lines.push(`> ${seg.text}`);
      lines.push("");
    }
  }

  lines.push(`## Guidance`);
  lines.push("");
  lines.push(
    "Do not rewrite a flagged paragraph based on the detector alone. Cross-reference with the Writing Style report (`agents/writing-style.md`). When both agents flag the same paragraph, that's actionable. Detector-only flags on case study prose are often false positives — terse, parallel-construction sentences trip the classifier even when the writing is authentic."
  );
  lines.push("");

  return lines.join("\n");
}

// --- main ------------------------------------------------------------------

async function scanCaseStudy(filePath: string, apiKey: string): Promise<CaseStudyResult> {
  const slug = path.basename(filePath, ".mdx");
  const raw = fs.readFileSync(filePath, "utf-8");
  const prose = mdxToProse(raw);
  const segments = paragraphSegments(prose);

  const result: CaseStudyResult = {
    slug,
    sourcePath: path.relative(process.cwd(), filePath),
    segments: segments.map((s) => ({ ...s })),
  };

  // Whole-document score
  try {
    result.overall = await callPangram(prose, apiKey);
  } catch (err) {
    console.error(
      `[ai-detect] overall scan failed for ${slug}: ${(err as Error).message}`
    );
    throw err;
  }

  // Per-paragraph scores
  for (const seg of result.segments) {
    try {
      seg.response = await callPangram(seg.text, apiKey);
    } catch (err) {
      seg.error = (err as Error).message;
    }
  }

  return result;
}

async function main() {
  const rootDir = path.resolve(import.meta.dirname, "..");
  loadDotenv(rootDir);

  const apiKey = process.env.PANGRAM_API_KEY;
  if (!apiKey) {
    console.warn(
      "[ai-detect] PANGRAM_API_KEY not set — skipping AI-detection check (exit 0)."
    );
    process.exit(0);
  }

  const { slug, file } = parseArgs();

  const workDir = path.join(rootDir, "src", "content", "work");
  let targets: string[];

  if (file) {
    targets = [path.resolve(rootDir, file)];
  } else if (slug) {
    targets = [path.join(workDir, `${slug}.mdx`)];
  } else {
    targets = fs
      .readdirSync(workDir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => path.join(workDir, f));
  }

  for (const t of targets) {
    if (!fs.existsSync(t)) {
      console.error(`[ai-detect] file not found: ${t}`);
      process.exit(1);
    }
  }

  const summary: Array<{ slug: string; score: number; report: string }> = [];

  for (const target of targets) {
    const doc = await scanCaseStudy(target, apiKey);

    const analysisDir = path.join(rootDir, "analysis", doc.slug);
    fs.mkdirSync(analysisDir, { recursive: true });

    const rawPath = path.join(analysisDir, "ai-detection-raw.json");
    fs.writeFileSync(rawPath, JSON.stringify(doc, null, 2));

    const basename = "ai-detection-report";
    let reportPath = path.join(analysisDir, `${basename}.md`);
    let v = 2;
    while (fs.existsSync(reportPath)) {
      reportPath = path.join(analysisDir, `${basename}-v${v}.md`);
      v += 1;
    }
    fs.writeFileSync(reportPath, renderReport(doc));

    summary.push({
      slug: doc.slug,
      score: scoreFromFractionAi(doc.overall?.fraction_ai),
      report: path.relative(rootDir, reportPath),
    });
  }

  console.log(JSON.stringify({ scanned: summary.length, results: summary }, null, 2));
}

main().catch((err) => {
  console.error(`[ai-detect] ${(err as Error).message}`);
  process.exit(1);
});
