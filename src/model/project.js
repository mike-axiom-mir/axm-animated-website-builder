export const SURFACE_MODES = ["clear", "glass", "solid"];
export const BACKGROUND_TYPES = ["world", "video", "image", "game"];
export const CURRENT_PROJECT_VERSION = 2;
export const PROJECT_FILE_FORMAT = "axm-animated-site-project";
export const PROJECT_FILE_VERSION = 1;

export const SCENE_STATES = {
  idle: { label: "Idle", sky: [4, 17, 27], sun: [255, 183, 102], accent: [53, 231, 255], speed: 0.28 },
  arrival: { label: "Arrival", sky: [21, 22, 48], sun: [255, 133, 86], accent: [82, 217, 255], speed: 0.5 },
  explore: { label: "Explore", sky: [6, 31, 43], sun: [255, 203, 126], accent: [61, 255, 205], speed: 0.75 },
  night: { label: "Night", sky: [2, 7, 20], sun: [94, 122, 255], accent: [69, 226, 255], speed: 0.2 },
};

const DEFAULT_PAGE = {
  surface: "clear",
  interaction: "decorative",
  showNavigation: true,
  heroNote: "",
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
  },
  page: structuredClone(DEFAULT_PAGE),
  metadata: {
    createdWith: "AXM Animated Website Builder",
    presentationOnly: true,
  },
};

export function updateProject(project, path, value) {
  const [root, leaf] = path.split(".");
  if (!leaf) return { ...project, [root]: value };
  return { ...project, [root]: { ...project[root], [leaf]: value } };
}

export function projectSnapshot(project) {
  return JSON.stringify(project, null, 2);
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
  let project = structuredClone(input);

  if (sourceVersion === 1) {
    project = {
      ...structuredClone(DEFAULT_PROJECT),
      ...project,
      version: CURRENT_PROJECT_VERSION,
      background: {
        ...DEFAULT_PROJECT.background,
        ...(project.background || {}),
      },
      page: {
        ...structuredClone(DEFAULT_PAGE),
        ...(project.page || {}),
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
    migrations.push("v1→v2");
  } else {
    project = {
      ...structuredClone(DEFAULT_PROJECT),
      ...project,
      version: CURRENT_PROJECT_VERSION,
      background: {
        ...DEFAULT_PROJECT.background,
        ...(project.background || {}),
      },
      page: {
        ...structuredClone(DEFAULT_PAGE),
        ...(project.page || {}),
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

  return { project, sourceVersion, migrations };
}

export function validateProject(project) {
  const holds = [];
  if (!project || project.format !== "axm-animated-site") holds.push("HOLD_INVALID_PROJECT");
  if (project?.version !== CURRENT_PROJECT_VERSION) holds.push("HOLD_PROJECT_MIGRATION_REQUIRED");
  if (!BACKGROUND_TYPES.includes(project?.background?.type)) holds.push("HOLD_UNKNOWN_BACKGROUND");
  if (!SCENE_STATES[project?.background?.state]) holds.push("HOLD_UNKNOWN_SCENE_STATE");
  if (!SURFACE_MODES.includes(project?.page?.surface)) holds.push("HOLD_UNKNOWN_SURFACE");
  if (["video", "image"].includes(project?.background?.type) && !project.background.mediaUrl) {
    holds.push("HOLD_MEDIA_SOURCE_REQUIRED");
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
    if (parsed.fileVersion !== PROJECT_FILE_VERSION) {
      throw new Error("HOLD_PROJECT_FILE_VERSION_UNSUPPORTED");
    }
    if (!parsed.project || typeof parsed.project !== "object") {
      throw new Error("HOLD_PROJECT_FILE_MISSING_PROJECT");
    }

    const canonicalSource = projectSnapshot(parsed.project);
    const actualSha256 = await sha256(canonicalSource);
    if (parsed.projectSha256 !== actualSha256) {
      throw new Error("HOLD_PROJECT_FILE_IDENTITY_MISMATCH");
    }

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
