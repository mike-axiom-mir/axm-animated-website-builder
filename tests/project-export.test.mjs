import assert from "node:assert/strict";
import test from "node:test";
import { buildStandaloneHtml } from "../src/export/exportSite.js";
import { DEFAULT_PROJECT, updateProject, validateProject } from "../src/model/project.js";

test("default project is a valid live-world composition", () => {
  assert.deepEqual(validateProject(DEFAULT_PROJECT), { ok: true, holds: [] });
});

test("media adapters hold until a source is bound", () => {
  const video = updateProject(DEFAULT_PROJECT, "background.type", "video");
  assert.deepEqual(validateProject(video), { ok: false, holds: ["HOLD_MEDIA_SOURCE_REQUIRED"] });
});

test("updating a nested value does not mutate the source project", () => {
  const next = updateProject(DEFAULT_PROJECT, "page.surface", "solid");
  assert.equal(DEFAULT_PROJECT.page.surface, "clear");
  assert.equal(next.page.surface, "solid");
  assert.notEqual(next.page, DEFAULT_PROJECT.page);
});

test("standalone export contains runtime and page but not editor chrome", () => {
  const html = buildStandaloneHtml(DEFAULT_PROJECT);
  assert.match(html, /<canvas id="world"><\/canvas>/);
  assert.match(html, /AXM — Enter the Workshop/);
  assert.match(html, /LIVE FRONTEND LAYER/);
  assert.doesNotMatch(html, /Scene layers/);
  assert.doesNotMatch(html, /Edit source/);
});

test("standalone export refuses an unresolved media source", () => {
  const image = updateProject(DEFAULT_PROJECT, "background.type", "image");
  assert.throws(() => buildStandaloneHtml(image), /HOLD_MEDIA_SOURCE_REQUIRED/);
});
