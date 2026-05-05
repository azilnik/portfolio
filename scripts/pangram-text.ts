// Quick adapter: submit arbitrary text to Pangram Labs v3 and print the result.
//
// Usage:
//   npx tsx scripts/pangram-text.ts <path-to-text-file>
//   echo "some text" | npx tsx scripts/pangram-text.ts -
//
// Reuses the .env loader pattern from ai-detect.ts.
// Exits 0 on success (prints score to stdout); exits 1 on API/network failure.

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
  windows?: Array<{
    text?: string;
    prediction?: string;
    ai_likelihood?: number;
  }>;
};

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

function scoreFromFractionAi(fractionAi: number | undefined): number {
  if (typeof fractionAi !== "number" || Number.isNaN(fractionAi)) return 5;
  return Math.round((1 - Math.max(0, Math.min(1, fractionAi))) * 10);
}

function formatPct(n?: number): string {
  return typeof n === "number" ? `${Math.round(n * 100)}%` : "—";
}

async function readInput(arg: string): Promise<string> {
  if (arg === "-") {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks).toString("utf-8").trim();
  }
  return fs.readFileSync(arg, "utf-8").trim();
}

async function main() {
  const rootDir = path.resolve(import.meta.dirname, "..");
  loadDotenv(rootDir);

  const apiKey = process.env.PANGRAM_API_KEY;
  if (!apiKey) {
    console.error("[pangram-text] PANGRAM_API_KEY not set in .env. Aborting.");
    process.exit(1);
  }

  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error("Usage: npx tsx scripts/pangram-text.ts <file|->");
    process.exit(1);
  }

  const text = await readInput(inputArg);
  if (!text) {
    console.error("[pangram-text] Empty input.");
    process.exit(1);
  }

  console.error(`[pangram-text] Submitting ${text.length} chars...`);

  let result: PangramResponse;
  try {
    result = await callPangram(text, apiKey);
  } catch (err) {
    console.error("[pangram-text] API error:", (err as Error).message);
    process.exit(1);
  }

  const score = scoreFromFractionAi(result.fraction_ai);
  console.log(`Score: ${score}/10  (10 = reads fully human, 0 = reads fully AI)`);
  console.log(`Prediction: ${result.prediction ?? result.prediction_short ?? "—"}`);
  console.log(`Fraction AI: ${formatPct(result.fraction_ai)}`);
  console.log(`Fraction AI-assisted: ${formatPct(result.fraction_ai_assisted)}`);
  console.log(`Fraction human: ${formatPct(result.fraction_human)}`);

  if (result.windows && result.windows.length) {
    console.log("\nPer-window:");
    for (const w of result.windows) {
      const wScore = w.ai_likelihood !== undefined
        ? Math.round((1 - w.ai_likelihood) * 10)
        : "—";
      const excerpt = (w.text ?? "").slice(0, 60).replace(/\n/g, " ");
      console.log(`  ${wScore}/10  ${w.prediction ?? "—"}  "${excerpt}${w.text && w.text.length > 60 ? "…" : ""}"`);
    }
  }
}

main();
