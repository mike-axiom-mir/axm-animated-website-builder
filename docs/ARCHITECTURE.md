# Architecture

## Composition

Editor or AI caller
  → shared revisioned builder session
  → canonical project state (schema v3)
    → background adapter: world / video / image / game
      → motion profile + scale
      → reusable scene atoms
    → semantic page
      → hero + entrance transition
      → navigation
      → sections + entrance transitions
      → desktop/phone visibility
      → clear / glass / solid surfaces

Portable project files wrap canonical state with schema version and SHA-256 identity.

Standalone export carries canonical project state plus a lightweight presentation runtime and semantic HTML/CSS. It does not carry editor or collaboration-session state.

## One mutation contract

src/contract/builderSession.js is the mutation boundary for both humans and AI.

Human controls emit command batches. AI submits the same serializable batches. Both advance one session revision and append actor-labelled receipts. Stale batches are held instead of overwriting newer work.

## Motion fabric

The motion fabric is intentionally smaller than a general animation engine.

Global profiles:
- still
- calm
- drift
- kinetic

Reusable scene atoms:
- orb
- ring
- beacon
- stream
- dust

Each atom carries normalized position, size, opacity, motion behavior, speed, phase, tone, and desktop/phone visibility. The Canvas editor runtime and standalone export interpret the same data.

This gives AI and humans a useful animated-website vocabulary without turning this repository into a universal graphics/game engine.

## Semantic motion

Hero and sections carry entrance transition state:
- none
- fade
- rise
- slide
- zoom

Duration and delay are bounded. Editor preview and standalone output both use intersection observation. Reduced-motion preference forces content visible without animation.

## Authoring controls

- src/editor/PageControls.jsx edits semantic content, surfaces, responsiveness and entrance transitions.
- src/editor/SceneMotionControls.jsx edits global motion and scene atoms.
- src/editor/CollaborationPanel.jsx exposes shared revision state and AI batch intake.

## Runtime adapters

world: deterministic Canvas 2D/2.5D scene + reusable atoms.
game: same canvas with explicit keyboard-input handoff.
video: native muted looping local video.
image: native local image layer.

A future WebGL or MorphTile adapter belongs behind this runtime boundary instead of taking over the page.
