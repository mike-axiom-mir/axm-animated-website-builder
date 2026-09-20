# Start here

## What this is

The AXM Animated Website Builder composes two independent frontend layers:

1. a background runtime that can animate or run continuously; and
2. a semantic HTML page that remains readable, accessible, and able to cover the runtime where appropriate.

The builder is its own product boundary. The first AXM front-door website now exists as one project made with it; that project is an acceptance case, not the definition of the builder.

## Current verified scope

Source code currently implements a procedural Canvas 2D world, a tiny game mode, local image/video binding, semantic hero/section/navigation authoring, clear/glass/solid surface switching, scene states, runtime preview, verified project save/open, schema migration, and standalone HTML generation.

Do not describe Canvas 2D output as full 3D or WebGL.

Fresh runtime and browser evidence is recorded separately during each accepted build. Source existence alone is not visual proof.

## Read next

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layer, project-state, and adapter boundaries.
- [`docs/PROJECT_FILES.md`](docs/PROJECT_FILES.md) — portable builder project envelopes and source identity.
- [`docs/RUNTIME_CONTRACT.md`](docs/RUNTIME_CONTRACT.md) — rules every background type must follow.
- [`docs/MORPHTILE_BOUNDARY.md`](docs/MORPHTILE_BOUNDARY.md) — what is reused and what remains separate.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — convergence-only next work.
- [`PROJECT_STATE.md`](PROJECT_STATE.md) — exact current status and holds.

## Non-negotiable behavior

- The page owns input unless the user explicitly enters an interactive background.
- A visible control must always return input to the page.
- Missing media is a visible HOLD, not a fake success.
- Invalid, tampered, or newer-than-supported project files are held instead of silently rewritten.
- Schema migration is explicit and reported when an older project is opened.
- Export excludes editor code.
- Adding an adapter must not require rewriting the page layer.
