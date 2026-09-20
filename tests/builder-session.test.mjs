import assert from "node:assert/strict";
import test from "node:test";
import { AXM_FRONT_DOOR_PROJECT } from "../src/projects/axmFrontDoor.js";
import {
  CURRENT_PROJECT_VERSION,
  DEFAULT_PROJECT,
  migrateProject,
} from "../src/model/project.js";
import {
  applyBuilderBatch,
  builderSessionSnapshot,
  createBuilderBatch,
  createBuilderSession,
} from "../src/contract/builderSession.js";

test("v3 projects migrate to section choreography schema v4", () => {
  const legacy = structuredClone(DEFAULT_PROJECT);
  legacy.version = 3;
  delete legacy.page.choreography;
  delete legacy.page.heroSceneCue;
  legacy.page.sections = legacy.page.sections.map(({ sceneCue, ...section }) => section);
  const migrated = migrateProject(legacy);
  assert.equal(migrated.project.version, CURRENT_PROJECT_VERSION);
  assert.deepEqual(migrated.migrations, ["v3→v4"]);
  assert.equal(migrated.project.page.choreography.enabled, true);
  assert.equal(migrated.project.page.heroSceneCue.recipe, "inherit");
  assert.equal(migrated.project.page.sections.every((section) => section.sceneCue.recipe === "inherit"), true);
});

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

  const ai = createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    label: "AI motion pass",
    commands: [
      { type: "motion.configure", payload: { profile: "kinetic", scale: 1.4 } },
      { type: "background.configure", payload: { state: "explore", atmosphere: 81 } },
    ],
  });
  result = applyBuilderBatch(session, ai);
  assert.equal(result.ok, true);
  assert.equal(result.session.revision, 2);
  assert.equal(result.session.project.background.motionProfile, "kinetic");
  assert.equal(result.session.project.background.motionScale, 1.4);
});

test("AI can compose reusable scene elements atomically", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const batch = createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    label: "Scene atom pass",
    commands: [{
      type: "scene.compose",
      payload: {
        motionProfile: "calm",
        motionScale: 0.8,
        elements: [
          {
            id: "hero-orb",
            type: "orb",
            x: 0.72,
            y: 0.28,
            size: 0.09,
            opacity: 0.8,
            motion: "float",
            speed: 0.7,
            phase: 0,
            tone: "accent",
            visibility: { desktop: true, mobile: true },
          },
          {
            id: "mobile-ring",
            type: "ring",
            x: 0.2,
            y: 0.65,
            size: 0.07,
            opacity: 0.55,
            motion: "pulse",
            speed: 1,
            phase: 1,
            tone: "ice",
            visibility: { desktop: false, mobile: true },
          },
        ],
      },
    }],
  });
  const result = applyBuilderBatch(session, batch);
  assert.equal(result.ok, true);
  assert.equal(result.session.project.background.sceneElements.length, 2);
  assert.equal(result.session.project.background.sceneElements[1].visibility.desktop, false);
});

test("AI and human can update one scene element through the same contract", () => {
  let session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  let result = applyBuilderBatch(session, createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    commands: [{
      type: "scene.element.add",
      payload: {
        element: {
          id: "signal",
          type: "beacon",
          x: 0.5,
          y: 0.4,
          size: 0.08,
          opacity: 0.8,
          motion: "pulse",
          speed: 1,
          phase: 0,
          tone: "accent",
          visibility: { desktop: true, mobile: true },
        },
      },
    }],
  }));
  assert.equal(result.ok, true);
  session = result.session;

  result = applyBuilderBatch(session, createBuilderBatch(session, {
    actor: { type: "human", id: "mike" },
    commands: [{
      type: "scene.element.update",
      payload: { id: "signal", patch: { x: 0.62, motion: "orbit" } },
    }],
  }));
  assert.equal(result.ok, true);
  const signal = result.session.project.background.sceneElements.find((element) => element.id === "signal");
  assert.equal(signal.x, 0.62);
  assert.equal(signal.motion, "orbit");
});

test("section transition and responsive visibility survive AI composition", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const batch = createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    commands: [{
      type: "page.compose",
      payload: {
        hero: {
          title: "Motion aware",
          surface: "glass",
          transition: { type: "zoom", duration: 800, delay: 80 },
        },
        navigation: [{ label: "Desktop", href: "#desktop" }],
        sections: [{
          id: "desktop",
          eyebrow: "DESKTOP",
          title: "Responsive section",
          body: "This section can be hidden on phones.",
          surface: "clear",
          points: [],
          transition: { type: "slide", duration: 700, delay: 100 },
          visibility: { desktop: true, mobile: false },
        }],
      },
    }],
  });
  const result = applyBuilderBatch(session, batch);
  assert.equal(result.ok, true);
  assert.equal(result.session.project.page.heroTransition.type, "zoom");
  assert.equal(result.session.project.page.sections[0].transition.type, "slide");
  assert.equal(result.session.project.page.sections[0].visibility.mobile, false);
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
});

test("a failing animation command rejects the whole batch", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const batch = createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    commands: [
      { type: "set", payload: { path: "title", value: "Temporary" } },
      {
        type: "scene.element.add",
        payload: {
          element: {
            id: "bad",
            type: "unknown",
            x: 0.5,
            y: 0.5,
            size: 0.1,
            opacity: 1,
            motion: "float",
            speed: 1,
            phase: 0,
            tone: "accent",
            visibility: { desktop: true, mobile: true },
          },
        },
      },
    ],
  });
  const result = applyBuilderBatch(session, batch);
  assert.equal(result.ok, false);
  assert.equal(result.session.project.title, AXM_FRONT_DOOR_PROJECT.title);
  assert.equal(result.session.revision, 0);
});

test("session snapshot carries current revision, project and actor log", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const snapshot = JSON.parse(builderSessionSnapshot(session));
  assert.equal(snapshot.format, "axm-builder-session");
  assert.equal(snapshot.revision, 0);
  assert.equal(snapshot.project.metadata.projectId, "axm-front-door-v1");
  assert.deepEqual(snapshot.log, []);
});


test("AI assigns reusable choreography recipes and bounded overrides", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const batch = createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    label: "Choreograph workshop",
    commands: [
      { type: "hero.choreograph", payload: { sceneCue: { recipe: "calm-intro", overrides: {} } } },
      {
        type: "section.choreograph",
        payload: {
          id: "workshop",
          sceneCue: {
            recipe: "cinematic",
            overrides: {
              atmosphere: 92,
              atomIntensity: 1.3,
              camera: { x: 0.05, y: -0.035, zoom: 1.12 },
              blendMs: 1050,
            },
          },
        },
      },
    ],
  });
  const result = applyBuilderBatch(session, batch);
  assert.equal(result.ok, true);
  assert.equal(result.session.project.page.heroSceneCue.recipe, "calm-intro");
  const workshop = result.session.project.page.sections.find((section) => section.id === "workshop");
  assert.equal(workshop.sceneCue.recipe, "cinematic");
  assert.equal(workshop.sceneCue.overrides.camera.zoom, 1.12);
});

test("invalid choreography recipe rejects the whole batch", () => {
  const session = createBuilderSession(AXM_FRONT_DOOR_PROJECT, { sessionId: "test" });
  const result = applyBuilderBatch(session, createBuilderBatch(session, {
    actor: { type: "ai", id: "website-ai" },
    commands: [
      { type: "set", payload: { path: "title", value: "Temporary" } },
      { type: "section.choreograph", payload: { id: "why", sceneCue: { recipe: "not-real", overrides: {} } } },
    ],
  }));
  assert.equal(result.ok, false);
  assert.equal(result.session.project.title, AXM_FRONT_DOOR_PROJECT.title);
  assert.equal(result.session.revision, 0);
});
