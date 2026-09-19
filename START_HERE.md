# Start here

## What this is

The AXM Animated Website Builder composes two independent frontend layers:

1. a background runtime that can animate or run continuously; and
2. a semantic HTML page that remains readable, accessible, and able to cover the runtime where appropriate.

The current editor is a focused proof of that contract. It is not the AXM front door; the front door will later be a project made with this builder.

## Current verified scope

Source code currently implements a procedural Canvas 2D world, a tiny game mode, local image/video binding, surface switching, state switching, runtime preview, and standalone HTML generation. Do not describe Canvas 2D output as full 3D or WebGL.

Fresh runtime and browser evidence is recorded separately during each accepted build. Source existence alone is not visual proof.

## Read next

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layer and adapter boundaries.
- [`docs/RUNTIME_CONTRACT.md`](docs/RUNTIME_CONTRACT.md) — rules every background type must follow.
- [`docs/MORPHTILE_BOUNDARY.md`](docs/MORPHTILE_BOUNDARY.md) — what is reused and what remains separate.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — convergence-only next work.
- [`PROJECT_STATE.md`](PROJECT_STATE.md) — exact current status and holds.

## Non-negotiable behavior

- The page owns input unless the user explicitly enters an interactive background.
- A visible control must always return input to the page.
- Missing media is a visible HOLD, not a fake success.
- Export excludes editor code.
- Adding an adapter must not require rewriting the page layer.
