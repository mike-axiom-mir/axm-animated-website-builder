# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable product direction

- This repository is an animated website builder, not the AXM front-door website itself.
- The background is a real frontend runtime layer. It may host procedural animation, video, assets, canvas/WebGL, or a browser game.
- Normal semantic HTML remains a separate page layer above that runtime. Sections may be clear, translucent, or solid.
- The page owns input by default. Interactive backgrounds receive control only through a deliberate handoff, with a persistent way back to the page.
- Published output should carry only the presentation runtime and selected content, not the editing environment.
- Keep the first builder narrow and understandable. Portability to apps and games is a benefit of the adapter contract, not permission to grow a universal engine here.
- MorphTile is AXM-owned. It may be reused where beneficial; separation is an efficiency and product-boundary decision, not a licensing prohibition.
- The selected visual direction is the World Stage mock: dark cinematic editor shell, scene hierarchy at left, very large living viewport, source/runtime switch at top, and scene-state strip at bottom.
