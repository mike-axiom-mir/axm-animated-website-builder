# AXM Animated Website Builder

Build ordinary websites whose background is a living frontend layer: a lightweight animated world, video, image asset, canvas/WebGL scene, or browser game. Semantic page content stays above it and can be clear, glass-like, or fully solid.

This first proof includes:

- a deterministic low-poly Canvas 2D world;
- image and video adapters using local files;
- a small interactive browser-game mode with explicit page-to-world input handoff;
- four scene states and three page-surface modes;
- a published-runtime preview; and
- one-file standalone HTML export without the editor.

It is intentionally an animated website builder, not a general game engine or the final AXM front door.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

Start with [`START_HERE.md`](START_HERE.md) before extending the product.

## Licensing

Current AXM-owned machine/workshop code: **PolyForm Noncommercial 1.0.0 + `CREATOR_OUTPUT_PERMISSION.md`**.

Commercial Creator Output is allowed; commercial exploitation of the builder itself requires separate permission.

Earlier published versions keep any historical licenses already granted to those versions. Third-party material remains under its own terms. See `LICENSE`, `LICENSE_BOUNDARY.md`, and `CREATOR_OUTPUT_PERMISSION.md`.
