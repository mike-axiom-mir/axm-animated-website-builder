# AXM front door — first real builder project

## Purpose

This is the first actual AXM front-door website produced through the Animated Website Builder project model and standalone exporter.

It deliberately stays inside the builder's narrow contract:

- one living frontend background;
- semantic HTML content above it;
- clear / glass / solid page surfaces;
- lightweight standalone export; and
- no MorphTile engine embedding or speculative universal-editor growth.

## Real-use controls added

Building a real multi-section front door exposed two needs that the single-hero proof did not exercise:

1. semantic navigation and scrollable sections must be part of canonical project state; and
2. section surface choice must survive the same project → preview → standalone export path.

Those controls are now data in `src/projects/axmFrontDoor.js`, rendered by the editor preview and the standalone exporter.

## Front-door content

The current project presents AXM as human + AI collaboration centered on agency, truth, continuity, inspectable state, reusable creation blocks, local/offline paths, and explicit merge gates.

The initial page has four sections: Why AXM, Method, Workshop, and Roots.

## Honest holds

- The front-door visual has not yet received user visual acceptance.
- Representative image/video adapters are still not visually accepted.
- Production-device performance remains unmeasured.
- The background is still Canvas 2D/2.5D, not full WebGL.
- PR #1 remains draft while real use continues to expose missing controls.
