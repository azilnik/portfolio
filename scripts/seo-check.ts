// Programmatic SEO checks against docs/SEO.md rules.
//
// Reads case study frontmatter and reports violations: missing seoTitle/
// seoDescription, length issues, banned phrases, ampersand abuse, etc.
//
// Usage:
//   npm run seo-check                        # all case studies
//   npm run seo-check -- --slug join-scenarios

import fs from "fs";
import path from "path";

type Frontmatter = {
  title?: string;
  company?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  thumbnailAlt?: string;
  draft?: boolean;
};

type Issue = {
  level: "error" | "warn";
  field: string;
  message: string;
};

type Result = {
  slug: string;
  frontmatter: Frontmatter;
  issues: Issue[];
};

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/;

const BANNED_PHRASES = [
  "crafting",
  "empowering",
  "leveraging",
  "unlocking",
  "delivering",
  "thoughtful digital experiences",
  "best-in-class",
  "world-class",
  "cutting-edge",
];

function parseArgs() {
  const args = process.argv.slice(2);
  const slugFlag = args.find((a) => a === "--slug" || a.startsWith("--slug="));
  const slug = slugFlag
    ? slugFlag.includes("=")
      ? slugFlag.split("=")[1]
      : args[args.indexOf(slugFlag) + 1]
    : undefined;
  return { slug };
}

/**
 * Minimal YAML frontmatter parser. We only need flat string/bool fields —
 * frontmatter shape is fixed by content.config.ts, so a regex pass is fine.
 */
function parseFrontmatter(raw: string): Frontmatter {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return {};
  const fm: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    let value: string | boolean = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === "true") value = true;
    else if (value === "false") value = false;
    (fm as Record<string, unknown>)[key] = value;
  }
  return fm;
}

function checkCaseStudy(filePath: string): Result {
  const raw = fs.readFileSync(filePath, "utf-8");
  const fm = parseFrontmatter(raw);
  const issues: Issue[] = [];

  // seoTitle
  if (!fm.seoTitle) {
    issues.push({
      level: "error",
      field: "seoTitle",
      message: "Missing — case studies should always set this. Falls back to a generic SERP title.",
    });
  } else {
    if (fm.seoTitle.length > 60) {
      issues.push({
        level: "error",
        field: "seoTitle",
        message: `Length ${fm.seoTitle.length} > 60 (Google truncates around 60 chars).`,
      });
    }
    if (fm.seoTitle.includes(" — Ari Zilnik")) {
      issues.push({
        level: "warn",
        field: "seoTitle",
        message: "BaseLayout auto-appends ' — Ari Zilnik'. Strip it from seoTitle to avoid duplication.",
      });
    }
    if (/\bDesign\b\s+&\s+\bProduct\b/.test(fm.seoTitle)) {
      issues.push({
        level: "warn",
        field: "seoTitle",
        message: "Avoid ampersand-as-connector in titles. Reserve & for proper nouns like 'Staking & API'.",
      });
    }
  }

  // seoDescription
  if (!fm.seoDescription) {
    issues.push({
      level: "error",
      field: "seoDescription",
      message: "Missing — `description` is too short to work as meta description. Set 120-160 char third-person copy.",
    });
  } else {
    if (fm.seoDescription.length < 100) {
      issues.push({
        level: "warn",
        field: "seoDescription",
        message: `Length ${fm.seoDescription.length} < 100. Target 120-160.`,
      });
    }
    if (fm.seoDescription.length > 160) {
      issues.push({
        level: "warn",
        field: "seoDescription",
        message: `Length ${fm.seoDescription.length} > 160 (Google truncates).`,
      });
    }
  }

  // description (tagline)
  if (!fm.description) {
    issues.push({
      level: "error",
      field: "description",
      message: "Missing tagline. 8-12 word punchy lede required.",
    });
  } else {
    const wordCount = fm.description.trim().split(/\s+/).length;
    if (wordCount > 14) {
      issues.push({
        level: "warn",
        field: "description",
        message: `Tagline is ${wordCount} words. Target 8-12 — this is a card subtitle, not a sentence.`,
      });
    }
  }

  // thumbnailAlt
  if (!fm.thumbnailAlt) {
    issues.push({
      level: "error",
      field: "thumbnailAlt",
      message: "Missing alt text. Required for accessibility — describe the image, not the role.",
    });
  } else if (fm.thumbnailAlt.length < 20) {
    issues.push({
      level: "warn",
      field: "thumbnailAlt",
      message: "Alt text is very short. A descriptive alt is more useful for screen readers and image SEO.",
    });
  }

  // banned phrases — scan title, description, seoTitle, seoDescription
  const fields: Array<keyof Frontmatter> = [
    "title",
    "description",
    "seoTitle",
    "seoDescription",
  ];
  for (const field of fields) {
    const value = fm[field];
    if (typeof value !== "string") continue;
    for (const phrase of BANNED_PHRASES) {
      if (new RegExp(`\\b${phrase}\\b`, "i").test(value)) {
        issues.push({
          level: "warn",
          field,
          message: `Banned phrase "${phrase}" — see docs/SEO.md voice rules.`,
        });
      }
    }
  }

  return {
    slug: path.basename(filePath, ".mdx"),
    frontmatter: fm,
    issues,
  };
}

function renderResult(r: Result): string {
  const lines: string[] = [];
  const errors = r.issues.filter((i) => i.level === "error").length;
  const warnings = r.issues.filter((i) => i.level === "warn").length;
  const status = errors ? "FAIL" : warnings ? "WARN" : "PASS";
  lines.push(`## ${r.slug} — ${status} (${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"})`);
  lines.push("");
  if (!r.issues.length) {
    lines.push("Clean.");
    return lines.join("\n");
  }
  for (const issue of r.issues) {
    const icon = issue.level === "error" ? "✗" : "!";
    lines.push(`${icon} **${issue.field}** — ${issue.message}`);
  }
  return lines.join("\n");
}

function main() {
  const rootDir = path.resolve(import.meta.dirname, "..");
  const workDir = path.join(rootDir, "src", "content", "work");
  const { slug } = parseArgs();

  const targets = slug
    ? [path.join(workDir, `${slug}.mdx`)]
    : fs
        .readdirSync(workDir)
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => path.join(workDir, f));

  for (const t of targets) {
    if (!fs.existsSync(t)) {
      console.error(`[seo-check] file not found: ${t}`);
      process.exit(1);
    }
  }

  const results = targets.map(checkCaseStudy);
  const totalErrors = results.reduce(
    (n, r) => n + r.issues.filter((i) => i.level === "error").length,
    0
  );
  const totalWarnings = results.reduce(
    (n, r) => n + r.issues.filter((i) => i.level === "warn").length,
    0
  );

  console.log(`# SEO Check — ${results.length} case ${results.length === 1 ? "study" : "studies"}\n`);
  console.log(`**Result:** ${totalErrors} error${totalErrors === 1 ? "" : "s"}, ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"}\n`);
  for (const r of results) {
    console.log(renderResult(r));
    console.log();
  }

  process.exit(totalErrors ? 1 : 0);
}

main();
