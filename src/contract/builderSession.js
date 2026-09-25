import { normalizeSceneCue, SCENE_RECIPES } from "../model/choreography.js";
import {
  BACKGROUND_TYPES,
  ELEMENT_MOTIONS,
  ELEMENT_TONES,
  MOTION_PROFILES,
  SCENE_ELEMENT_TYPES,
  SCENE_STATES,
  SURFACE_MODES,
  TRANSITION_TYPES,
  migrateProject,
  validateProject,
} from "../model/project.js";

export const BUILDER_SESSION_FORMAT = "axm-builder-session";
export const BUILDER_SESSION_VERSION = 1;
export const BUILDER_BATCH_FORMAT = "axm-builder-command-batch";
export const BUILDER_BATCH_VERSION = 1;

const ACTOR_TYPES = new Set(["human", "ai", "system"]);
const SET_PATHS = new Set([
  "title", "eyebrow", "action",
  "background.type", "background.state", "background.seed", "background.motion",
  "background.atmosphere", "background.mediaUrl", "background.motionProfile", "background.motionScale",
  "page.surface", "page.interaction", "page.showNavigation", "page.heroNote", "page.choreography.enabled",
  "page.heroTransition.type", "page.heroTransition.duration", "page.heroTransition.delay",
  "page.footer.left", "page.footer.right",
]);
const SECTION_PATCH_KEYS = new Set(["eyebrow", "title", "body", "surface", "points", "links", "transition", "visibility", "sceneCue"]);
const NAV_PATCH_KEYS = new Set(["label", "href"]);
const BACKGROUND_PATCH_KEYS = new Set([
  "type", "state", "seed", "motion", "atmosphere", "mediaUrl",
  "motionProfile", "motionScale",
]);
const HERO_PATCH_KEYS = new Set(["title", "eyebrow", "action", "heroNote", "surface", "transition", "sceneCue"]);
const ELEMENT_PATCH_KEYS = new Set(["type", "x", "y", "size", "opacity", "motion", "speed", "phase", "tone", "visibility"]);

function failure(code, extra = {}) {
  return { ok: false, holds: [code], ...extra };
}

function immutableSet(source, path, value) {
  const parts = path.split(".");
  const root = structuredClone(source);
  let cursor = root;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    cursor[part] = { ...(cursor[part] || {}) };
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = value;
  return root;
}

function onlyPatch(patch, allowed, holdCode) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new Error(holdCode);
  const result = {};
  for (const [key, value] of Object.entries(patch)) {
    if (!allowed.has(key)) throw new Error(holdCode);
    result[key] = structuredClone(value);
  }
  return result;
}

function requireIndex(index, length, holdCode) {
  if (!Number.isInteger(index) || index < 0 || index >= length) throw new Error(holdCode);
}

function assertTransition(transition) {
  if (!transition || typeof transition !== "object" || !TRANSITION_TYPES.includes(transition.type)) {
    throw new Error("HOLD_INVALID_TRANSITION");
  }
}

function assertElementPatch(patch) {
  if (patch.type !== undefined && !SCENE_ELEMENT_TYPES.includes(patch.type)) throw new Error("HOLD_UNKNOWN_SCENE_ELEMENT_TYPE");
  if (patch.motion !== undefined && !ELEMENT_MOTIONS.includes(patch.motion)) throw new Error("HOLD_UNKNOWN_ELEMENT_MOTION");
  if (patch.tone !== undefined && !ELEMENT_TONES.includes(patch.tone)) throw new Error("HOLD_UNKNOWN_ELEMENT_TONE");
}

function applyCommand(project, command) {
  if (!command || typeof command !== "object" || Array.isArray(command) || typeof command.type !== "string") {
    throw new Error("HOLD_INVALID_BUILDER_COMMAND");
  }
  const payload = command.payload || {};

  if (command.type === "set") {
    if (!SET_PATHS.has(payload.path)) throw new Error("HOLD_COMMAND_PATH_NOT_ALLOWED");
    if (payload.path === "background.type" && !BACKGROUND_TYPES.includes(payload.value)) throw new Error("HOLD_UNKNOWN_BACKGROUND");
    if (payload.path === "background.state" && !SCENE_STATES[payload.value]) throw new Error("HOLD_UNKNOWN_SCENE_STATE");
    if (payload.path === "background.motionProfile" && !MOTION_PROFILES[payload.value]) throw new Error("HOLD_UNKNOWN_MOTION_PROFILE");
    if (payload.path === "page.surface" && !SURFACE_MODES.includes(payload.value)) throw new Error("HOLD_UNKNOWN_SURFACE");
    if (payload.path === "page.heroTransition.type" && !TRANSITION_TYPES.includes(payload.value)) throw new Error("HOLD_INVALID_TRANSITION");
    return immutableSet(project, payload.path, structuredClone(payload.value));
  }

  if (command.type === "background.configure") {
    const patch = onlyPatch(payload, BACKGROUND_PATCH_KEYS, "HOLD_INVALID_BACKGROUND_PATCH");
    if (patch.type !== undefined && !BACKGROUND_TYPES.includes(patch.type)) throw new Error("HOLD_UNKNOWN_BACKGROUND");
    if (patch.state !== undefined && !SCENE_STATES[patch.state]) throw new Error("HOLD_UNKNOWN_SCENE_STATE");
    if (patch.motionProfile !== undefined && !MOTION_PROFILES[patch.motionProfile]) throw new Error("HOLD_UNKNOWN_MOTION_PROFILE");
    return { ...project, background: { ...project.background, ...patch } };
  }

  if (command.type === "motion.configure") {
    if (payload.profile !== undefined && !MOTION_PROFILES[payload.profile]) throw new Error("HOLD_UNKNOWN_MOTION_PROFILE");
    return {
      ...project,
      background: {
        ...project.background,
        ...(payload.profile !== undefined ? { motionProfile: payload.profile } : {}),
        ...(payload.scale !== undefined ? { motionScale: payload.scale } : {}),
        ...(payload.enabled !== undefined ? { motion: Boolean(payload.enabled) } : {}),
      },
    };
  }

  if (command.type === "choreography.configure") {
    return {
      ...project,
      page: {
        ...project.page,
        choreography: {
          ...project.page.choreography,
          ...(payload.enabled !== undefined ? { enabled: Boolean(payload.enabled) } : {}),
        },
      },
    };
  }

  if (command.type === "hero.choreograph") {
    if (!SCENE_RECIPES[payload.sceneCue?.recipe || "inherit"]) throw new Error("HOLD_UNKNOWN_SCENE_RECIPE");
    return {
      ...project,
      page: {
        ...project.page,
        heroSceneCue: normalizeSceneCue(payload.sceneCue),
      },
    };
  }

  if (command.type === "hero.configure") {
    const patch = onlyPatch(payload, HERO_PATCH_KEYS, "HOLD_INVALID_HERO_PATCH");
    const next = { ...project, page: { ...project.page } };
    if (patch.title !== undefined) next.title = patch.title;
    if (patch.eyebrow !== undefined) next.eyebrow = patch.eyebrow;
    if (patch.action !== undefined) next.action = patch.action;
    if (patch.heroNote !== undefined) next.page.heroNote = patch.heroNote;
    if (patch.surface !== undefined) {
      if (!SURFACE_MODES.includes(patch.surface)) throw new Error("HOLD_UNKNOWN_SURFACE");
      next.page.surface = patch.surface;
    }
    if (patch.transition !== undefined) {
      assertTransition(patch.transition);
      next.page.heroTransition = structuredClone(patch.transition);
    }
    if (patch.sceneCue !== undefined) next.page.heroSceneCue = normalizeSceneCue(patch.sceneCue);
    return next;
  }

  if (command.type === "scene.compose") {
    const next = structuredClone(project);
    if (payload.motionProfile !== undefined) {
      if (!MOTION_PROFILES[payload.motionProfile]) throw new Error("HOLD_UNKNOWN_MOTION_PROFILE");
      next.background.motionProfile = payload.motionProfile;
    }
    if (payload.motionScale !== undefined) next.background.motionScale = payload.motionScale;
    if (payload.elements !== undefined) next.background.sceneElements = structuredClone(payload.elements);
    return next;
  }

  if (command.type === "scene.element.add") {
    const element = structuredClone(payload.element);
    if (!element?.id || project.background.sceneElements.some((item) => item.id === element.id)) {
      throw new Error("HOLD_INVALID_SCENE_ELEMENT_ID");
    }
    const elements = [...project.background.sceneElements];
    const index = payload.index === undefined ? elements.length : payload.index;
    if (!Number.isInteger(index) || index < 0 || index > elements.length) throw new Error("HOLD_INVALID_SCENE_ELEMENT_INDEX");
    elements.splice(index, 0, element);
    return { ...project, background: { ...project.background, sceneElements: elements } };
  }

  if (command.type === "scene.element.update") {
    const index = project.background.sceneElements.findIndex((item) => item.id === payload.id);
    if (index < 0) throw new Error("HOLD_SCENE_ELEMENT_NOT_FOUND");
    const patch = onlyPatch(payload.patch, ELEMENT_PATCH_KEYS, "HOLD_INVALID_SCENE_ELEMENT_PATCH");
    assertElementPatch(patch);
    const elements = project.background.sceneElements.map((element, itemIndex) => itemIndex === index ? { ...element, ...patch } : element);
    return { ...project, background: { ...project.background, sceneElements: elements } };
  }

  if (command.type === "scene.element.remove") {
    if (!project.background.sceneElements.some((item) => item.id === payload.id)) throw new Error("HOLD_SCENE_ELEMENT_NOT_FOUND");
    return {
      ...project,
      background: {
        ...project.background,
        sceneElements: project.background.sceneElements.filter((item) => item.id !== payload.id),
      },
    };
  }

  if (command.type === "scene.element.move") {
    const fromIndex = project.background.sceneElements.findIndex((item) => item.id === payload.id);
    if (fromIndex < 0) throw new Error("HOLD_SCENE_ELEMENT_NOT_FOUND");
    requireIndex(payload.toIndex, project.background.sceneElements.length, "HOLD_INVALID_SCENE_ELEMENT_INDEX");
    const elements = [...project.background.sceneElements];
    const [element] = elements.splice(fromIndex, 1);
    elements.splice(payload.toIndex, 0, element);
    return { ...project, background: { ...project.background, sceneElements: elements } };
  }

  if (command.type === "section.add") {
    const section = structuredClone(payload.section);
    if (!section?.id || typeof section.id !== "string") throw new Error("HOLD_INVALID_SECTION_ID");
    if (project.page.sections.some((item) => item.id === section.id)) throw new Error("HOLD_DUPLICATE_SECTION_ID");
    const next = [...project.page.sections];
    const index = payload.index === undefined ? next.length : payload.index;
    if (!Number.isInteger(index) || index < 0 || index > next.length) throw new Error("HOLD_INVALID_SECTION_INDEX");
    next.splice(index, 0, section);
    return { ...project, page: { ...project.page, sections: next } };
  }

  if (command.type === "section.choreograph") {
    const index = project.page.sections.findIndex((item) => item.id === payload.id);
    if (index < 0) throw new Error("HOLD_SECTION_NOT_FOUND");
    if (!SCENE_RECIPES[payload.sceneCue?.recipe || "inherit"]) throw new Error("HOLD_UNKNOWN_SCENE_RECIPE");
    const sections = project.page.sections.map((section, itemIndex) => itemIndex === index
      ? { ...section, sceneCue: normalizeSceneCue(payload.sceneCue) }
      : section);
    return { ...project, page: { ...project.page, sections } };
  }

  if (command.type === "section.update") {
    const index = project.page.sections.findIndex((item) => item.id === payload.id);
    if (index < 0) throw new Error("HOLD_SECTION_NOT_FOUND");
    const patch = onlyPatch(payload.patch, SECTION_PATCH_KEYS, "HOLD_INVALID_SECTION_PATCH");
    if (patch.surface !== undefined && !SURFACE_MODES.includes(patch.surface)) throw new Error("HOLD_UNKNOWN_SECTION_SURFACE");
    if (patch.transition !== undefined) assertTransition(patch.transition);
    if (patch.sceneCue !== undefined && !SCENE_RECIPES[patch.sceneCue?.recipe || "inherit"]) throw new Error("HOLD_UNKNOWN_SCENE_RECIPE");
    const sections = project.page.sections.map((section, itemIndex) => itemIndex === index ? { ...section, ...patch } : section);
    return { ...project, page: { ...project.page, sections } };
  }

  if (command.type === "section.remove") {
    if (!project.page.sections.some((item) => item.id === payload.id)) throw new Error("HOLD_SECTION_NOT_FOUND");
    return {
      ...project,
      page: {
        ...project.page,
        sections: project.page.sections.filter((item) => item.id !== payload.id),
        navigation: project.page.navigation.filter((item) => item.href !== `#${payload.id}`),
      },
    };
  }

  if (command.type === "section.move") {
    const fromIndex = project.page.sections.findIndex((item) => item.id === payload.id);
    if (fromIndex < 0) throw new Error("HOLD_SECTION_NOT_FOUND");
    requireIndex(payload.toIndex, project.page.sections.length, "HOLD_INVALID_SECTION_INDEX");
    const sections = [...project.page.sections];
    const [section] = sections.splice(fromIndex, 1);
    sections.splice(payload.toIndex, 0, section);
    return { ...project, page: { ...project.page, sections } };
  }

  if (command.type === "navigation.add") {
    if (!payload.item?.label || !payload.item?.href) throw new Error("HOLD_INVALID_NAVIGATION_ITEM");
    const navigation = [...project.page.navigation];
    const index = payload.index === undefined ? navigation.length : payload.index;
    if (!Number.isInteger(index) || index < 0 || index > navigation.length) throw new Error("HOLD_INVALID_NAVIGATION_INDEX");
    navigation.splice(index, 0, structuredClone(payload.item));
    return { ...project, page: { ...project.page, navigation } };
  }

  if (command.type === "navigation.update") {
    requireIndex(payload.index, project.page.navigation.length, "HOLD_INVALID_NAVIGATION_INDEX");
    const patch = onlyPatch(payload.patch, NAV_PATCH_KEYS, "HOLD_INVALID_NAVIGATION_PATCH");
    const navigation = project.page.navigation.map((item, index) => index === payload.index ? { ...item, ...patch } : item);
    return { ...project, page: { ...project.page, navigation } };
  }

  if (command.type === "navigation.remove") {
    requireIndex(payload.index, project.page.navigation.length, "HOLD_INVALID_NAVIGATION_INDEX");
    return { ...project, page: { ...project.page, navigation: project.page.navigation.filter((_, index) => index !== payload.index) } };
  }

  if (command.type === "page.compose") {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("HOLD_INVALID_PAGE_COMPOSITION");
    let next = structuredClone(project);
    if (payload.hero !== undefined) next = applyCommand(next, { type: "hero.configure", payload: payload.hero });
    if (payload.navigation !== undefined) next.page.navigation = structuredClone(payload.navigation);
    if (payload.sections !== undefined) next.page.sections = structuredClone(payload.sections);
    if (payload.footer !== undefined) next.page.footer = { ...next.page.footer, ...structuredClone(payload.footer) };
    if (payload.showNavigation !== undefined) next.page.showNavigation = Boolean(payload.showNavigation);
    return next;
  }

  throw new Error("HOLD_UNKNOWN_BUILDER_COMMAND");
}

export function createBuilderSession(project, { sessionId = "local-session" } = {}) {
  const migrated = migrateProject(project);
  const check = validateProject(migrated.project);
  if (!check.ok) throw new Error(check.holds.join(", "));
  return {
    format: BUILDER_SESSION_FORMAT,
    version: BUILDER_SESSION_VERSION,
    sessionId,
    revision: 0,
    project: migrated.project,
    log: [],
  };
}

export function createBuilderBatch(session, { actor, label = "", commands }) {
  return {
    format: BUILDER_BATCH_FORMAT,
    version: BUILDER_BATCH_VERSION,
    baseRevision: session.revision,
    actor: structuredClone(actor),
    label,
    commands: structuredClone(commands),
  };
}

export function applyBuilderBatch(session, batch) {
  if (!session || session.format !== BUILDER_SESSION_FORMAT || session.version !== BUILDER_SESSION_VERSION) return failure("HOLD_INVALID_BUILDER_SESSION", { session });
  if (!batch || batch.format !== BUILDER_BATCH_FORMAT || batch.version !== BUILDER_BATCH_VERSION) return failure("HOLD_INVALID_COMMAND_BATCH", { session });
  if (!ACTOR_TYPES.has(batch.actor?.type) || !batch.actor?.id) return failure("HOLD_INVALID_COMMAND_ACTOR", { session });
  if (batch.baseRevision !== session.revision) {
    return failure("HOLD_SESSION_REVISION_CONFLICT", {
      session,
      expectedRevision: session.revision,
      receivedRevision: batch.baseRevision,
    });
  }
  if (!Array.isArray(batch.commands) || batch.commands.length === 0 || batch.commands.length > 100) return failure("HOLD_INVALID_COMMAND_BATCH", { session });

  let project = structuredClone(session.project);
  try {
    for (const command of batch.commands) project = applyCommand(project, command);
  } catch (error) {
    return failure(error.message || "HOLD_COMMAND_FAILED", { session });
  }

  const migrated = migrateProject(project);
  const check = validateProject(migrated.project);
  if (!check.ok) return { ok: false, holds: check.holds, session };

  const revision = session.revision + 1;
  const batchId = batch.id || `${session.sessionId}:r${revision}:${batch.actor.type}:${batch.actor.id}`;
  const logEntry = {
    revision,
    batchId,
    actor: structuredClone(batch.actor),
    label: String(batch.label || ""),
    commandCount: batch.commands.length,
    commandTypes: batch.commands.map((command) => command.type),
  };

  return {
    ok: true,
    session: {
      ...session,
      revision,
      project: migrated.project,
      log: [...session.log, logEntry],
    },
    receipt: {
      batchId,
      fromRevision: session.revision,
      toRevision: revision,
      actor: structuredClone(batch.actor),
    },
  };
}

export function parseBuilderBatch(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("HOLD_COMMAND_BATCH_NOT_JSON");
  }
  if (parsed?.format !== BUILDER_BATCH_FORMAT) throw new Error("HOLD_INVALID_COMMAND_BATCH");
  return parsed;
}

export function builderSessionSnapshot(session) {
  return JSON.stringify({
    format: BUILDER_SESSION_FORMAT,
    version: BUILDER_SESSION_VERSION,
    sessionId: session.sessionId,
    revision: session.revision,
    project: session.project,
    log: session.log,
  }, null, 2);
}
