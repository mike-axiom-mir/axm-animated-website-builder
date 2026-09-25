#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { buildProjectFile, parseProjectFile } from "../src/model/project.js";
import { applyBuilderBatch, createBuilderSession } from "../src/contract/builderSession.js";

const [inputPath, batchPath, outputPath] = process.argv.slice(2);
if (!inputPath || !batchPath || !outputPath) {
  console.error("Usage: node scripts/apply-builder-batch.mjs <input.axm.json> <batch.json> <output.axm.json>");
  process.exit(2);
}

const opened = await parseProjectFile(await readFile(inputPath, "utf8"), { sourceName: inputPath });
const batch = JSON.parse(await readFile(batchPath, "utf8"));
const session = createBuilderSession(opened.project, { sessionId: "cli-session" });
const result = applyBuilderBatch(session, batch);

if (!result.ok) {
  console.error(JSON.stringify({
    ok: false,
    holds: result.holds,
    expectedRevision: result.expectedRevision,
    receivedRevision: result.receivedRevision,
  }, null, 2));
  process.exit(1);
}

const saved = await buildProjectFile(result.session.project);
await writeFile(outputPath, saved.text);
console.log(JSON.stringify({
  ok: true,
  output: outputPath,
  projectSha256: saved.receipt.sha256,
  sessionRevision: result.session.revision,
  batchReceipt: result.receipt,
}, null, 2));
