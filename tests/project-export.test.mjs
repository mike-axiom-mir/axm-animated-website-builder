import assert from "node:assert/strict";
import test from "node:test";
import { buildStandaloneHtml } from "../src/export/exportSite.js";
import { DEFAULT_PROJECT, updateProject, validateProject } from "../src/model/project.js";
import { AXM_FRONT_DOOR_PROJECT } from "../src/projects/axmFrontDoor.js";

test("default project is a valid live-world composition", () => {
  assert.deepEqual(validateProject(DEFAULT_PROJECT), { ok: true, holds: [] });
});

test("AXM front door is a valid builder project", () => {
  assert.deepEqual(validateProject(AXM_FRONT_DOOR_PROJECT), { ok: true, holds: [] });
  assert.equal(AXM_FRONT_DOOR_PROJECT.page.sections.length, 4);
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
  assert.match(html, /IDEAS SHAPE WORLDS/);
  assert.doesNotMatch(html, /Scene layers/);
  assert.doesNotMatch(html, /Edit source/);
  const script = html.match(/<script>([\s\S]*)<\/script>/);
  assert.ok(script, "standalone runtime script is present");
  assert.doesNotThrow(() => new Function(script[1]), "standalone runtime script parses");
});

test("front-door export carries semantic sections and navigation", () => {
  const html = buildStandaloneHtml(AXM_FRONT_DOOR_PROJECT);
  assert.match(html, /Build with AI\. Keep your agency\./);
  assert.match(html, /id="why"/);
  assert.match(html, /id="method"/);
  assert.match(html, /id="workshop"/);
  assert.match(html, /id="roots"/);
  assert.match(html, /href="#why"/);
  assert.match(html, /Explore the work on GitHub/);
  assert.doesNotMatch(html, /Scene layers/);
  const script = html.match(/<script>([\s\S]*)<\/script>/);
  assert.ok(script, "front-door runtime script is present");
  assert.doesNotThrow(() => new Function(script[1]), "front-door runtime script parses");
});

test("section surfaces reject unsupported values", () => {
  const broken = structuredClone(AXM_FRONT_DOOR_PROJECT);
  broken.page.sections[0].surface = "fog";
  assert.deepEqual(validateProject(broken), { ok: false, holds: ["HOLD_UNKNOWN_SECTION_SURFACE"] });
});

test("standalone export refuses an unresolved media source", () => {
  const image = updateProject(DEFAULT_PROJECT, "background.type", "image");
  assert.throws(() => buildStandaloneHtml(image), /HOLD_MEDIA_SOURCE_REQUIRED/);
});
