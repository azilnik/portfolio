// @ts-nocheck — runs via tsx; node typings not in portfolio tsconfig
// Pangram Labs v3 AI-detection check for portfolio MDX case studies.
// Modeled on resume-builder/scripts/ai-detect.ts.
//
// Usage:
//   PANGRAM_API_KEY=<key> npx tsx scripts/ai-detect-mdx.ts <path-to-mdx>
//
// Strips frontmatter, JSX components/imports, and inline markdown,
// then submits the body once overall + once per H2 section.
// Writes a markdown report to scripts/.ai-detect-output/<slug>-report.md
// and prints a one-line JSON summary.

import fs from "fs";
import path from "path";

const PANGRAM_ENDPOINT =
  process.env.PANGRAM_API_URL ?? "https://text.api.pangram.com/v3";
const REQUEST_TIMEOUT_MS = 15_000;

type PangramResponse = {
  prediction?: string;
  prediction_short?: string;
  fraction_ai?: number;
  fraction_ai_assisted?: number;
  fraction_human?: number;
};

type Segment = { label: string; text: string };
type SegmentResult = Segment & { response?: PangramResponse; error?: string };

function loadDotenvFromResumeBuilder() {
  // The Pangram key lives in /Users/arizilnik/development/resume-builder/.env
  const candidate = path.resolve(
    process.cwd(),
    "..",
    "resume-builder",
    ".env",
  );
  if (!fs.existsSync(candidate)) return;
  for (const line of fs.readFileSync(candidate, "utf-8").split("\n")) {
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

function stripFrontmatter(src: string): string {
  if (src.startsWith("---")) {
    const end = src.indexOf("\n---", 3);
    if (end !== -1) return src.slice(end + 4).replace(/^\s+/, "");
  }
  return src;
}

function stripImports(src: string): string {
  return src.replace(/^import\s+[^\n]+;?\n?/gm, "");
}

function stripJSX(src: string): string {
  // Drop self-closing and balanced JSX blocks (e.g., <Credits ... />, <FullBleedImage ... />)
  // Crude but adequate for these MDX files.
  return src
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, "")
    .replace(/<[A-Z][A-Za-z0-9]*[\s\S]*?<\/[A-Z][A-Za-z0-9]*>/g, "");
}

function stripInlineMarkdown(src: string): string {
  return src
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

function loadMdxSegments(filePath: string): {
  overall: string;
  segments: Segment[];
} {
  let body = fs.readFileSync(filePath, "utf-8");
  body = stripFrontmatter(body);
  body = stripImports(body);
  body = stripJSX(body);
  body = stripInlineMarkdown(body);

  const lines = body.split("\n");
  const sections: { label: string; lines: string[] }[] = [
    { label: "Intro", lines: [] },
  ];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      sections.push({ label: m[1].trim(), lines: [] });
      continue;
    }
    if (line.startsWith("#")) continue; // skip H1 if present
    sections[sections.length - 1].lines.push(line);
  }

  const segments = sections
    .map((s) => ({
      label: s.label,
      text: s.lines.join(" ").replace(/\s+/g, " ").trim(),
    }))
    .filter((s) => s.text.length > 60);

  const overall = segments.map((s) => s.text).join("\n\n");
  return { overall, segments };
}

async function callPangram(
  text: string,
  apiKey: string,
): Promise<PangramResponse> {
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

function scoreFromFractionAi(fractionAi: number | undefined): number {
  if (typeof fractionAi !== "number" || Number.isNaN(fractionAi)) return 5;
  return Math.round((1 - Math.max(0, Math.min(1, fractionAi))) * 10);
}
function pct(n?: number): string {
  return typeof n === "number" ? `${Math.round(n * 100)}%` : "—";
}

async function main() {
  loadDotenvFromResumeBuilder();
  const apiKey = process.env.PANGRAM_API_KEY;
  if (!apiKey) {
    console.error("[ai-detect-mdx] PANGRAM_API_KEY not set");
    process.exit(2);
  }

  const target = process.argv[2];
  if (!target) {
    console.error(
      "[ai-detect-mdx] usage: tsx scripts/ai-detect-mdx.ts <path-to-mdx>",
    );
    process.exit(2);
  }
  const filePath = path.resolve(target);
  if (!fs.existsSync(filePath)) {
    console.error(`[ai-detect-mdx] file not found: ${filePath}`);
    process.exit(2);
  }

  const { overall, segments } = loadMdxSegments(filePath);
  if (!overall || !segments.length) {
    console.error("[ai-detect-mdx] no body prose found in MDX file");
    process.exit(2);
  }

  let overallResult: PangramResponse;
  try {
    overallResult = await callPangram(overall, apiKey);
  } catch (err) {
    console.error(
      `[ai-detect-mdx] overall scan failed: ${(err as Error).message}`,
    );
    process.exit(1);
  }

  const segmentResults: SegmentResult[] = [];
  for (const seg of segments) {
    try {
      const r = await callPangram(seg.text, apiKey);
      segmentResults.push({ ...seg, response: r });
    } catch (err) {
      segmentResults.push({ ...seg, error: (err as Error).message });
    }
  }

  // Render report — output dir lives next to this script regardless of input path
  const slug = path.basename(filePath, path.extname(filePath));
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const outDir = path.join(scriptDir, ".ai-detect-output");
  fs.mkdirSync(outDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const overallScore = scoreFromFractionAi(overallResult.fraction_ai);
  const lines: string[] = [];
  lines.push(`# AI-Detection Report: ${slug}`);
  lines.push(`Date: ${date}`);
  lines.push(`Detector: Pangram Labs v3`);
  lines.push("");
  lines.push(`## Overall Score: ${overallScore}/10`);
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(
    `| Prediction | ${overallResult.prediction ?? overallResult.prediction_short ?? "—"} |`,
  );
  lines.push(`| Fraction AI | ${pct(overallResult.fraction_ai)} |`);
  lines.push(
    `| Fraction AI-assisted | ${pct(overallResult.fraction_ai_assisted)} |`,
  );
  lines.push(`| Fraction human | ${pct(overallResult.fraction_human)} |`);
  lines.push("");
  lines.push(`### Per-section results`);
  lines.push("");
  lines.push(`| Section | Score | Prediction | AI % | Excerpt |`);
  lines.push(`|---|---|---|---|---|`);
  for (const s of segmentResults) {
    if (s.error) {
      lines.push(`| ${s.label} | — | error | — | ${s.error} |`);
      continue;
    }
    const r = s.response ?? {};
    const score = scoreFromFractionAi(r.fraction_ai);
    const excerpt = s.text.slice(0, 80).replace(/\|/g, "\\|");
    lines.push(
      `| ${s.label} | ${score}/10 | ${r.prediction_short ?? r.prediction ?? "—"} | ${pct(
        r.fraction_ai,
      )} | ${excerpt}${s.text.length > 80 ? "…" : ""} |`,
    );
  }
  lines.push("");
  const flagged = segmentResults.filter(
    (s) => s.response && scoreFromFractionAi(s.response.fraction_ai) < 7,
  );
  if (flagged.length) {
    lines.push(`### Flagged sections (score < 7)`);
    lines.push("");
    for (const s of flagged) {
      const score = scoreFromFractionAi(s.response!.fraction_ai);
      lines.push(`**${s.label}** — ${score}/10 (${pct(s.response!.fraction_ai)} AI)`);
      lines.push("");
      lines.push(`> ${s.text}`);
      lines.push("");
    }
  }

  const basename = `${slug}-report`;
  let reportPath = path.join(outDir, `${basename}.md`);
  let v = 2;
  while (fs.existsSync(reportPath)) {
    reportPath = path.join(outDir, `${basename}-v${v}.md`);
    v += 1;
  }
  fs.writeFileSync(reportPath, lines.join("\n"));

  console.log(
    JSON.stringify({
      slug,
      score: overallScore,
      report: path.relative(process.cwd(), reportPath),
      sections: segmentResults.map((s) => ({
        label: s.label,
        score: scoreFromFractionAi(s.response?.fraction_ai),
      })),
    }),
  );
}

main().catch((err) => {
  console.error(`[ai-detect-mdx] ${(err as Error).message}`);
  process.exit(1);
});
