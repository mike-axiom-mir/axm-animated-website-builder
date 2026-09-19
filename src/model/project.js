export const SURFACE_MODES = ["clear", "glass", "solid"];
export const BACKGROUND_TYPES = ["world", "video", "image", "game"];

export const SCENE_STATES = {
  idle: { label: "Idle", sky: [4, 17, 27], sun: [255, 183, 102], accent: [53, 231, 255], speed: 0.28 },
  arrival: { label: "Arrival", sky: [21, 22, 48], sun: [255, 133, 86], accent: [82, 217, 255], speed: 0.5 },
  explore: { label: "Explore", sky: [6, 31, 43], sun: [255, 203, 126], accent: [61, 255, 205], speed: 0.75 },
  night: { label: "Night", sky: [2, 7, 20], sun: [94, 122, 255], accent: [69, 226, 255], speed: 0.2 },
};

export const DEFAULT_PROJECT = {
  format: "axm-animated-site",
  version: 1,
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
  page: {
    surface: "clear",
    interaction: "decorative",
    showNavigation: true,
  },
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

export function validateProject(project) {
  const holds = [];
  if (!project || project.format !== "axm-animated-site") holds.push("HOLD_INVALID_PROJECT");
  if (!BACKGROUND_TYPES.includes(project?.background?.type)) holds.push("HOLD_UNKNOWN_BACKGROUND");
  if (!SCENE_STATES[project?.background?.state]) holds.push("HOLD_UNKNOWN_SCENE_STATE");
  if (!SURFACE_MODES.includes(project?.page?.surface)) holds.push("HOLD_UNKNOWN_SURFACE");
  if (["video", "image"].includes(project?.background?.type) && !project.background.mediaUrl) {
    holds.push("HOLD_MEDIA_SOURCE_REQUIRED");
  }

  const sections = project?.page?.sections;
  if (sections !== undefined && !Array.isArray(sections)) {
    holds.push("HOLD_INVALID_PAGE_SECTIONS");
  } else if (Array.isArray(sections)) {
    const ids = new Set();
    for (const section of sections) {
      if (!section?.id || ids.has(section.id)) holds.push("HOLD_INVALID_SECTION_ID");
      if (section?.id) ids.add(section.id);
      if (!SURFACE_MODES.includes(section?.surface || "clear")) holds.push("HOLD_UNKNOWN_SECTION_SURFACE");
    }
  }

  const navigation = project?.page?.navigation;
  if (navigation !== undefined && !Array.isArray(navigation)) holds.push("HOLD_INVALID_NAVIGATION");

  return { ok: holds.length === 0, holds: [...new Set(holds)] };
}

export function projectSnapshot(project) {
  return JSON.stringify(project, null, 2);
}
