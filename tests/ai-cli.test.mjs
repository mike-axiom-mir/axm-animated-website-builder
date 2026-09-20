import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { buildProjectFile, parseProjectFile } from "../src/model/project.js";
import { AXM_FRONT_DOOR_PROJECT } from "../src/projects/axmFrontDoor.js";

const execFileAsync = promisify(execFile);

test("AI CLI applies a command batch and writes a verified project", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "axm-builder-cli-"));
  const input = path.join(dir, "input.axm.json");
  const batch = path.join(dir, "batch.json");
  const output = path.join(dir, "output.axm.json");

  const saved = await buildProjectFile(AXM_FRONT_DOOR_PROJECT);
  await writeFile(input, saved.text);
  await writeFile(batch, JSON.stringify({
    format: "axm-builder-command-batch",
    version: 1,
    baseRevision: 0,
    actor: { type: "ai", id: "cli-test-ai" },
    label: "CLI title pass",
    commands: [
      { type: "hero.configure", payload: { title: "Built through the AI CLI" } },
      { type: "background.configure", payload: { state: "explore", atmosphere: 77 } }
    ]
  }, null, 2));

  const { stdout } = await execFileAsync(process.execPath, [
    "scripts/apply-builder-batch.mjs",
    input,
    batch,
    output,
  ], { cwd: process.cwd() });

  const receipt = JSON.parse(stdout);
  assert.equal(receipt.ok, true);
  assert.equal(receipt.sessionRevision, 1);

  const opened = await parseProjectFile(await readFile(output, "utf8"), { sourceName: output });
  assert.equal(opened.receipt.verified, true);
  assert.equal(opened.project.title, "Built through the AI CLI");
  assert.equal(opened.project.background.state, "explore");
  assert.equal(opened.project.background.atmosphere, 77);
});
