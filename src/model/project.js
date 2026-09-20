export const SURFACE_MODES = ["clear", "glass", "solid"];
export const BACKGROUND_TYPES = ["world", "video", "image", "game"];
export const MOTION_PROFILES = {
  still: { label: "Still", speed: 0 },
  calm: { label: "Calm", speed: 0.45 },
  drift: { label: "Drift", speed: 1 },
  kinetic: { label: "Kinetic", speed: 1.75 },
};
export const SCENE_ELEMENT_TYPES = ["orb", "ring", "beacon", "stream", "dust"];
export const ELEMENT_MOTIONS = ["still", "drift", "float", "pulse", "orbit"];
export const ELEMENT_TONES = ["accent", "sun", "ice", "muted"];
export const TRANSITION_TYPES = ["none", "fade", "rise", "slide", "zoom"];
export const CURRENT_PROJECT_VERSION = 3;
export const PROJECT_FILE_FORMAT = "axm-animated-site-project";
export const PROJECT_FILE_VERSION = 1;

export const SCENE_STATES = {
  idle: { label: "Idle", sky: [4, 17, 27], sun: [255, 183, 102], accent: [53, 231, 255], speed: 0.28 },
  arrival: { label: "Arrival", sky: [21, 22, 48], sun: [255, 133, 86], accent: [82, 217, 255], speed: 0.5 },
  explore: { label: "Explore", sky: [6, 31, 43], sun: [255, 203, 126], accent: [61, 255, 205], speed: 0.75 },
  night: { label: "Night", sky: [2, 7, 20], sun: [94, 122, 255], accent: [69, 226, 255], speed: 0.2 },
};

export const DEFAULT_TRANSITION = {
  type: "rise",
  duration: 650,
  delay: 0,
};

export const DEFAULT_VISIBILITY = {
  desktop: true,
  mobile: true,
};

const DEFAULT_PAGE = {
  surface: "clear",
  interaction: "decorative",
  showNavigation: true,
  heroNote: "",
  heroTransition: { ...DEFAULT_TRANSITION, type: "fade", duration: 700 },
  navigation: [],
  sections: [],
  footer: {
    left: "IDEAS SHAPE WORLDS",
    right: "LIVE FRONTEND LAYER",
  },
};

export const DEFAULT_PROJECT = {
  format: "axm-animated-site",
  version: CURRENT_PROJECT_VERSION,
  title: "AXM — Enter the Workshop",
  eyebrow: "WEBSITES AS LIVING WORLDS",
  action: "Explore",
  background: {
    type: "world",
    state: "idle",
    seed: 19,
    motion: true,
    atmosphere: 72,
    mediaUrl: "",
    motionProfile: "drift",
    motionScale: 1,
    sceneElements: [],
  },
  page: structuredClone(DEFAULT_PAGE),
  metadata: {
    createdWith: "AXM Animated Website Builder",
    presentationOnly: true,
  },
};

export function updateProject(project, path, value) {
  const parts = path.split(".");
  const root = structuredClone(project);
  let cursor = root;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    cursor[part] = { ...(cursor[part] || {}) };
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = value;
  return root;
}

export function projectSnapshot(project) {
  return JSON.stringify(project, null, 2);
}

function normalizeTransition(value, fallback = DEFAULT_TRANSITION) {
  return {
    ...fallback,
    ...(value || {}),
  };
}

function normalizeVisibility(value) {
  return {
    ...DEFAULT_VISIBILITY,
    ...(value || {}),
  };
}

function normalizeSection(section) {
  return {
    ...section,
    surface: section?.surface || "clear",
    points: Array.isArray(section?.points) ? section.points : [],
    transition: normalizeTransition(section?.transition),
    visibility: normalizeVisibility(section?.visibility),
  };
}

function normalizeSceneElement(element) {
  return {
    id: element?.id || "",
    type: element?.type || "orb",
    x: element?.x ?? 0.5,
    y: element?.y ?? 0.5,
    size: element?.size ?? 0.08,
    opacity: element?.opacity ?? 0.7,
    motion: element?.motion || "float",
    speed: element?.speed ?? 1,
    phase: element?.phase ?? 0,
    tone: element?.tone || "accent",
    visibility: normalizeVisibility(element?.visibility),
  };
}

function normalizeCurrent(project) {
  return {
    ...structuredClone(DEFAULT_PROJECT),
    ...project,
    version: CURRENT_PROJECT_VERSION,
    background: {
      ...DEFAULT_PROJECT.background,
      ...(project.background || {}),
      sceneElements: Array.isArray(project.background?.sceneElements)
        ? project.background.sceneElements.map(normalizeSceneElement)
        : [],
    },
    page: {
      ...structuredClone(DEFAULT_PAGE),
      ...(project.page || {}),
      heroTransition: normalizeTransition(project.page?.heroTransition, DEFAULT_PAGE.heroTransition),
      sections: Array.isArray(project.page?.sections)
        ? project.page.sections.map(normalizeSection)
        : [],
      navigation: Array.isArray(project.page?.navigation) ? structuredClone(project.page.navigation) : [],
      footer: {
        ...DEFAULT_PAGE.footer,
        ...(project.page?.footer || {}),
      },
    },
    metadata: {
      ...DEFAULT_PROJECT.metadata,
      ...(project.metadata || {}),
    },
  };
}

export function migrateProject(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("HOLD_INVALID_PROJECT");
  }
  if (input.format !== "axm-animated-site") {
    throw new Error("HOLD_INVALID_PROJECT");
  }

  const sourceVersion = Number(input.version || 1);
  if (!Number.isInteger(sourceVersion) || sourceVersion < 1) {
    throw new Error("HOLD_INVALID_PROJECT_VERSION");
  }
  if (sourceVersion > CURRENT_PROJECT_VERSION) {
    throw new Error("HOLD_PROJECT_VERSION_NEWER_THAN_BUILDER");
  }

  const migrations = [];
  if (sourceVersion === 1) migrations.push("v1→v2", "v2→v3");
  if (sourceVersion === 2) migrations.push("v2→v3");

  return {
    project: normalizeCurrent(structuredClone(input)),
    sourceVersion,
    migrations,
  };
}

function validUnit(value) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function validTransition(transition) {
  return transition
    && TRANSITION_TYPES.includes(transition.type)
    && Number.isFinite(transition.duration)
    && transition.duration >= 0
    && transition.duration <= 5000
    && Number.isFinite(transition.delay)
    && transition.delay >= 0
    && transition.delay <= 5000;
}

function validVisibility(visibility) {
  return visibility
    && typeof visibility.desktop === "boolean"
    && typeof visibility.mobile === "boolean";
}

export function validateProject(project) {
  const holds = [];
  if (!project || project.format !== "axm-animated-site") holds.push("HOLD_INVALID_PROJECT");
  if (project?.version !== CURRENT_PROJECT_VERSION) holds.push("HOLD_PROJECT_MIGRATION_REQUIRED");
  if (!BACKGROUND_TYPES.includes(project?.background?.type)) holds.push("HOLD_UNKNOWN_BACKGROUND");
  if (!SCENE_STATES[project?.background?.state]) holds.push("HOLD_UNKNOWN_SCENE_STATE");
  if (!MOTION_PROFILES[project?.background?.motionProfile]) holds.push("HOLD_UNKNOWN_MOTION_PROFILE");
  if (!Number.isFinite(project?.background?.motionScale) || project.background.motionScale < 0 || project.background.motionScale > 3) {
    holds.push("HOLD_INVALID_MOTION_SCALE");
  }
  if (!SURFACE_MODES.includes(project?.page?.surface)) holds.push("HOLD_UNKNOWN_SURFACE");
  if (!validTransition(project?.page?.heroTransition)) holds.push("HOLD_INVALID_HERO_TRANSITION");
  if (["video", "image"].includes(project?.background?.type) && !project.background.mediaUrl) {
    holds.push("HOLD_MEDIA_SOURCE_REQUIRED");
  }

  const elements = project?.background?.sceneElements;
  if (!Array.isArray(elements)) {
    holds.push("HOLD_INVALID_SCENE_ELEMENTS");
  } else {
    const ids = new Set();
    for (const element of elements) {
      if (!element?.id || ids.has(element.id)) holds.push("HOLD_INVALID_SCENE_ELEMENT_ID");
      if (element?.id) ids.add(element.id);
      if (!SCENE_ELEMENT_TYPES.includes(element?.type)) holds.push("HOLD_UNKNOWN_SCENE_ELEMENT_TYPE");
      if (!ELEMENT_MOTIONS.includes(element?.motion)) holds.push("HOLD_UNKNOWN_ELEMENT_MOTION");
      if (!ELEMENT_TONES.includes(element?.tone)) holds.push("HOLD_UNKNOWN_ELEMENT_TONE");
      if (!validUnit(element?.x) || !validUnit(element?.y)) holds.push("HOLD_INVALID_SCENE_ELEMENT_POSITION");
      if (!Number.isFinite(element?.size) || element.size <= 0 || element.size > 0.5) holds.push("HOLD_INVALID_SCENE_ELEMENT_SIZE");
      if (!validUnit(element?.opacity)) holds.push("HOLD_INVALID_SCENE_ELEMENT_OPACITY");
      if (!Number.isFinite(element?.speed) || element.speed < 0 || element.speed > 4) holds.push("HOLD_INVALID_SCENE_ELEMENT_SPEED");
      if (!Number.isFinite(element?.phase) || element.phase < -10 || element.phase > 10) holds.push("HOLD_INVALID_SCENE_ELEMENT_PHASE");
      if (!validVisibility(element?.visibility)) holds.push("HOLD_INVALID_SCENE_ELEMENT_VISIBILITY");
    }
  }

  const sections = project?.page?.sections;
  if (!Array.isArray(sections)) {
    holds.push("HOLD_INVALID_PAGE_SECTIONS");
  } else {
    const ids = new Set();
    for (const section of sections) {
      if (!section?.id || ids.has(section.id)) holds.push("HOLD_INVALID_SECTION_ID");
      if (section?.id) ids.add(section.id);
      if (!SURFACE_MODES.includes(section?.surface || "clear")) holds.push("HOLD_UNKNOWN_SECTION_SURFACE");
      if (section?.points !== undefined && !Array.isArray(section.points)) holds.push("HOLD_INVALID_SECTION_POINTS");
      if (!validTransition(section?.transition)) holds.push("HOLD_INVALID_SECTION_TRANSITION");
      if (!validVisibility(section?.visibility)) holds.push("HOLD_INVALID_SECTION_VISIBILITY");
    }
  }

  const navigation = project?.page?.navigation;
  if (!Array.isArray(navigation)) {
    holds.push("HOLD_INVALID_NAVIGATION");
  } else {
    for (const item of navigation) {
      if (!item?.label || !item?.href) holds.push("HOLD_INVALID_NAVIGATION_ITEM");
    }
  }

  return { ok: holds.length === 0, holds: [...new Set(holds)] };
}

async function sha256(text) {
  if (!globalThis.crypto?.subtle) throw new Error("HOLD_SHA256_UNAVAILABLE");
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

export async function buildProjectFile(project) {
  const migrated = migrateProject(project);
  const check = validateProject(migrated.project);
  if (!check.ok) throw new Error(check.holds.join(", "));

  const canonicalProject = projectSnapshot(migrated.project);
  const projectSha256 = await sha256(canonicalProject);
  const envelope = {
    format: PROJECT_FILE_FORMAT,
    fileVersion: PROJECT_FILE_VERSION,
    projectSha256,
    project: migrated.project,
  };

  return {
    text: JSON.stringify(envelope, null, 2),
    receipt: {
      sha256: projectSha256,
      verified: true,
      sourceName: null,
      sourceVersion: migrated.sourceVersion,
      migrations: migrated.migrations,
    },
  };
}

export async function parseProjectFile(text, { sourceName = null } = {}) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("HOLD_PROJECT_FILE_NOT_JSON");
  }

  if (parsed?.format === PROJECT_FILE_FORMAT) {
    if (parsed.fileVersion !== PROJECT_FILE_VERSION) throw new Error("HOLD_PROJECT_FILE_VERSION_UNSUPPORTED");
    if (!parsed.project || typeof parsed.project !== "object") throw new Error("HOLD_PROJECT_FILE_MISSING_PROJECT");

    const canonicalSource = projectSnapshot(parsed.project);
    const actualSha256 = await sha256(canonicalSource);
    if (parsed.projectSha256 !== actualSha256) throw new Error("HOLD_PROJECT_FILE_IDENTITY_MISMATCH");

    const migrated = migrateProject(parsed.project);
    const check = validateProject(migrated.project);
    if (!check.ok) throw new Error(check.holds.join(", "));

    return {
      project: migrated.project,
      receipt: {
        sha256: actualSha256,
        verified: true,
        sourceName,
        sourceVersion: migrated.sourceVersion,
        migrations: migrated.migrations,
      },
    };
  }

  if (parsed?.format === "axm-animated-site") {
    const legacySha256 = await sha256(projectSnapshot(parsed));
    const migrated = migrateProject(parsed);
    const check = validateProject(migrated.project);
    if (!check.ok) throw new Error(check.holds.join(", "));

    return {
      project: migrated.project,
      receipt: {
        sha256: legacySha256,
        verified: false,
        sourceName,
        sourceVersion: migrated.sourceVersion,
        migrations: migrated.migrations,
      },
    };
  }

  throw new Error("HOLD_UNKNOWN_PROJECT_FILE_FORMAT");
}
