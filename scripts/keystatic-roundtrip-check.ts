/**
 * Verifies Keystatic can parse a converted .mdoc back into its editor model.
 * The reader uses the same Markdoc parsing + component validation the admin UI
 * does, so a clean read here means the file round-trips in /keystatic.
 *
 * Usage: tsx scripts/keystatic-roundtrip-check.ts <slug> [<slug> ...]
 */
import { createReader } from "@keystatic/core/reader";
import config from "../keystatic.config";

const reader = createReader(process.cwd(), config);
const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("Pass at least one slug.");
  process.exit(1);
}

let failed = false;
for (const slug of slugs) {
  try {
    const entry = await reader.collections.work.read(slug);
    if (!entry) {
      console.error(`✗ ${slug}: not found by Keystatic reader`);
      failed = true;
      continue;
    }
    const content = await entry.content();
    const nodeCount = JSON.stringify(content).length;
    console.log(
      `✓ ${slug}: parsed (title="${entry.title}", body node serialized ${nodeCount} chars)`
    );
  } catch (err) {
    console.error(`✗ ${slug}: ${(err as Error).message}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
