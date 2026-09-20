import assert from "node:assert/strict";
import test from "node:test";
import { AXM_FRONT_DOOR_PROJECT } from "../src/projects/axmFrontDoor.js";
import {
  applyBuilderBatch,
  builderSessionSnapshot,
  createBuilderBatch,
  createBuilderSession,
} from "../src/contract/builderSession.js";

test("human and AI changes use the same revisioned session contract", () => {
  let session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const human = createBuilderBatch(session, {
    actor: { type: "human", id: "mike" },
    label: "Human title edit",
    commands: [{ type: "set", payload: { path: "title", value: "Human shaped" } }],
  });
  let result = applyBuilderBatch(session, human);
  assert.equal(result.ok, true);
  session = result.session;
  assert.equal(session.revision, 1);
  assert.equal(session.project.title, "Human shaped");
  assert.equal(session.log[0].actor.type, "human");

  const ai = createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    label: "AI atmosphere pass",
    commands: [{ type: "background.configure", payload: { state: "explore", atmosphere: 81 } }],
  });
  result = applyBuilderBatch(session, ai);
  assert.equal(result.ok, true);
  assert.equal(result.session.revision, 2);
  assert.equal(result.session.project.background.state, "explore");
  assert.equal(result.session.project.background.atmosphere, 81);
  assert.equal(result.session.log[1].actor.type, "ai");
});

test("stale AI work is held instead of overwriting a newer human revision", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const staleAi = {
    format: "axm-builder-command-batch",
    version: 1,
    baseRevision: 4,
    actor: { type: "ai", id: "website-ai" },
    label: "Stale batch",
    commands: [{ type: "set", payload: { path: "title", value: "Should not land" } }],
  };
  const result = applyBuilderBatch(session, staleAi);
  assert.equal(result.ok, false);
  assert.deepEqual(result.holds, ["HOLD_SESSION_REVISION_CONFLICT"]);
  assert.equal(result.session.project.title, AXM_FRONT_DOOR_PROJECT.title);
});

test("AI can compose semantic page content atomically", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const batch = createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    label: "Compose site",
    commands: [{
      type: "page.compose",
      payload: {
        hero: { title: "AI composition", surface: "glass" },
        navigation: [{ label: "Start", href: "#start" }],
        sections: [{
          id: "start",
          eyebrow: "START",
          title: "One generated section",
          body: "This came through the public builder command contract.",
          surface: "clear",
          points: ["Inspectable", "Editable"],
        }],
        footer: { left: "AI + HUMAN", right: "ONE CONTRACT" },
      },
    }],
  });
  const result = applyBuilderBatch(session, batch);
  assert.equal(result.ok, true);
  assert.equal(result.session.project.title, "AI composition");
  assert.equal(result.session.project.page.sections[0].id, "start");
  assert.equal(result.session.project.page.footer.right, "ONE CONTRACT");
});

test("a failing command rejects the whole batch", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const batch = createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    label: "Bad batch",
    commands: [
      { type: "set", payload: { path: "title", value: "Temporary" } },
      { type: "set", payload: { path: "private.secret", value: "no" } },
    ],
  });
  const result = applyBuilderBatch(session, batch);
  assert.equal(result.ok, false);
  assert.deepEqual(result.holds, ["HOLD_COMMAND_PATH_NOT_ALLOWED"]);
  assert.equal(result.session.project.title, AXM_FRONT_DOOR_PROJECT.title);
  assert.equal(result.session.revision, 0);
});

test("removing a section also removes matching navigation", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const batch = createBuilderBatch(session, {
    actor: { type: "human", id: "mike" },
    label: "Remove why",
    commands: [{ type: "section.remove", payload: { id: "why" } }],
  });
  const result = applyBuilderBatch(session, batch);
  assert.equal(result.ok, true);
  assert.equal(result.session.project.page.sections.some((item) => item.id === "why"), false);
  assert.equal(result.session.project.page.navigation.some((item) => item.href === "#why"), false);
});

test("session snapshot carries current revision, project and actor log", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const snapshot = JSON.parse(builderSessionSnapshot(session));
  assert.equal(snapshot.format, "axm-builder-session");
  assert.equal(snapshot.revision, 0);
  assert.equal(snapshot.project.metadata.projectId, "axm-front-door-v1");
  assert.deepEqual(snapshot.log, []);
});
