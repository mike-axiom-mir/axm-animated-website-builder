export const SCENE_RECIPES = {
  inherit: {
    label: "Inherit",
    description: "Keep the base world settings.",
    config: {},
  },
  "calm-intro": {
    label: "Calm intro",
    description: "Quiet arrival with restrained motion.",
    config: {
      state: "arrival",
      motionProfile: "calm",
      motionScale: 0.72,
      atmosphere: 78,
      atomIntensity: 0.7,
      camera: { x: 0, y: 0, zoom: 1 },
      blendMs: 950,
    },
  },
  "product-reveal": {
    label: "Product reveal",
    description: "Clearer motion and a gentle push toward the subject.",
    config: {
      state: "explore",
      motionProfile: "drift",
      motionScale: 1.08,
      atmosphere: 72,
      atomIntensity: 1,
      camera: { x: 0.03, y: -0.025, zoom: 1.055 },
      blendMs: 760,
    },
  },
  technical: {
    label: "Technical",
    description: "Cool, measured motion with tighter framing.",
    config: {
      state: "night",
      motionProfile: "calm",
      motionScale: 0.58,
      atmosphere: 62,
      atomIntensity: 0.58,
      camera: { x: -0.025, y: 0.015, zoom: 1.025 },
      blendMs: 700,
    },
  },
  cinematic: {
    label: "Cinematic",
    description: "Slow atmospheric push with stronger visual depth.",
    config: {
      state: "arrival",
      motionProfile: "drift",
      motionScale: 0.9,
      atmosphere: 88,
      atomIntensity: 1.18,
      camera: { x: 0.04, y: -0.04, zoom: 1.1 },
      blendMs: 1150,
    },
  },
  playful: {
    label: "Playful",
    description: "Brighter motion with more active atoms.",
    config: {
      state: "explore",
      motionProfile: "kinetic",
      motionScale: 1.2,
      atmosphere: 74,
      atomIntensity: 1.25,
      camera: { x: -0.035, y: 0.025, zoom: 1.035 },
      blendMs: 620,
    },
  },
};

export const DEFAULT_SCENE_CUE = {
  recipe: "inherit",
  overrides: {},
};

const OVERRIDE_KEYS = new Set([
  "state",
  "motionProfile",
  "motionScale",
  "atmosphere",
  "atomIntensity",
  "camera",
  "blendMs",
]);

export function normalizeSceneCue(cue) {
  const input = cue && typeof cue === "object" && !Array.isArray(cue) ? cue : DEFAULT_SCENE_CUE;
  return {
    recipe: typeof input.recipe === "string" ? input.recipe : "inherit",
    overrides: input.overrides && typeof input.overrides === "object" && !Array.isArray(input.overrides)
      ? structuredClone(input.overrides)
      : {},
  };
}

export function validateSceneCue(cue, { sceneStates, motionProfiles } = {}) {
  const holds = [];
  const normalized = normalizeSceneCue(cue);
  if (!SCENE_RECIPES[normalized.recipe]) holds.push("HOLD_UNKNOWN_SCENE_RECIPE");

  for (const key of Object.keys(normalized.overrides)) {
    if (!OVERRIDE_KEYS.has(key)) holds.push("HOLD_UNKNOWN_SCENE_CUE_OVERRIDE");
  }

  const o = normalized.overrides;
  if (o.state !== undefined && sceneStates && !sceneStates[o.state]) holds.push("HOLD_UNKNOWN_SCENE_STATE");
  if (o.motionProfile !== undefined && motionProfiles && !motionProfiles[o.motionProfile]) holds.push("HOLD_UNKNOWN_MOTION_PROFILE");
  if (o.motionScale !== undefined && (!Number.isFinite(o.motionScale) || o.motionScale < 0 || o.motionScale > 3)) holds.push("HOLD_INVALID_MOTION_SCALE");
  if (o.atmosphere !== undefined && (!Number.isFinite(o.atmosphere) || o.atmosphere < 0 || o.atmosphere > 100)) holds.push("HOLD_INVALID_CHOREOGRAPHY_ATMOSPHERE");
  if (o.atomIntensity !== undefined && (!Number.isFinite(o.atomIntensity) || o.atomIntensity < 0 || o.atomIntensity > 1.5)) holds.push("HOLD_INVALID_ATOM_INTENSITY");
  if (o.blendMs !== undefined && (!Number.isFinite(o.blendMs) || o.blendMs < 0 || o.blendMs > 3000)) holds.push("HOLD_INVALID_CHOREOGRAPHY_BLEND");
  if (o.camera !== undefined) {
    const camera = o.camera;
    if (!camera || typeof camera !== "object" || Array.isArray(camera)) {
      holds.push("HOLD_INVALID_CHOREOGRAPHY_CAMERA");
    } else {
      if (camera.x !== undefined && (!Number.isFinite(camera.x) || camera.x < -0.25 || camera.x > 0.25)) holds.push("HOLD_INVALID_CHOREOGRAPHY_CAMERA");
      if (camera.y !== undefined && (!Number.isFinite(camera.y) || camera.y < -0.25 || camera.y > 0.25)) holds.push("HOLD_INVALID_CHOREOGRAPHY_CAMERA");
      if (camera.zoom !== undefined && (!Number.isFinite(camera.zoom) || camera.zoom < 0.75 || camera.zoom > 1.35)) holds.push("HOLD_INVALID_CHOREOGRAPHY_CAMERA");
    }
  }

  return [...new Set(holds)];
}

export function resolveSceneCue(background, cue) {
  const normalized = normalizeSceneCue(cue);
  const recipe = SCENE_RECIPES[normalized.recipe]?.config || {};
  const overrides = normalized.overrides || {};
  const recipeCamera = recipe.camera || {};
  const overrideCamera = overrides.camera || {};

  return {
    state: overrides.state ?? recipe.state ?? background.state,
    motionProfile: overrides.motionProfile ?? recipe.motionProfile ?? background.motionProfile,
    motionScale: overrides.motionScale ?? recipe.motionScale ?? background.motionScale,
    atmosphere: overrides.atmosphere ?? recipe.atmosphere ?? background.atmosphere,
    atomIntensity: overrides.atomIntensity ?? recipe.atomIntensity ?? 1,
    camera: {
      x: overrideCamera.x ?? recipeCamera.x ?? 0,
      y: overrideCamera.y ?? recipeCamera.y ?? 0,
      zoom: overrideCamera.zoom ?? recipeCamera.zoom ?? 1,
    },
    blendMs: overrides.blendMs ?? recipe.blendMs ?? 800,
    recipe: normalized.recipe,
  };
}
