# Start here

## What this is

The AXM Animated Website Builder composes two independent frontend layers:

1. a background runtime that can animate or run continuously; and
2. a semantic HTML page that remains readable, accessible, and able to cover the runtime where appropriate.

The builder is its own product boundary. The first AXM front-door website exists as one project made with it; that project is an acceptance case, not the definition of the builder.

## Current verified scope

Source code currently implements a procedural Canvas 2D/2.5D world, image/video/game adapters, reusable animated scene atoms, global motion profiles, desktop/phone visibility, semantic page authoring, per-section entrance transitions, runtime preview, verified project save/open, schema migration, a shared revisioned AI+human session, a headless AI CLI, and standalone HTML generation.

Do not describe Canvas 2D/2.5D output as full 3D or WebGL.

Fresh runtime and browser evidence is recorded separately during each accepted build. Source existence alone is not visual proof.

## Read next

- docs/ARCHITECTURE.md — layer, project-state, motion, and adapter boundaries.
- docs/PROJECT_FILES.md — portable builder project envelopes and source identity.
- docs/AI_BUILDER_CONTRACT.md — AI commands, motion commands, shared sessions, and CLI use.
- docs/RUNTIME_CONTRACT.md — rules every background type must follow.
- docs/MORPHTILE_BOUNDARY.md — what is reused and what remains separate.
- docs/ROADMAP.md — convergence-only next work.
- PROJECT_STATE.md — exact current status and holds.

## Non-negotiable behavior

- The page owns input unless the user explicitly enters an interactive background.
- A visible control must always return input to the page.
- Missing media is a visible HOLD, not a fake success.
- Invalid, tampered, or newer-than-supported project files are held instead of silently rewritten.
- Schema migration is explicit and reported when an older project is opened.
- AI and human edits share one command/session contract; there is no privileged AI mutation path.
- A stale collaboration batch is held rather than silently overwriting newer work.
- Reduced-motion users must not depend on entrance animation to read content.
- Responsive visibility is explicit project state, not hidden editor state.
- Export excludes editor code and collaboration-session history.
- Adding an adapter must not require rewriting the semantic page layer.
