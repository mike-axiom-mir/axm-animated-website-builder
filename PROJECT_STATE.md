# Project state

Recorded: 2026-09-20

## Current candidate identity

- Draft PR: mike-axiom-mir/axm-animated-website-builder#1
- Remote review branch: world-stage-builder-v0
- Motion-fabric executable code head: 779bb3d0fbae17d3d77616b2b41884e0b9ac9f29
- Visual-evidence workflow head: 05ae6270834a8e08b07a01f7a322c3cd9acbe5a8
- GitHub Actions verification: run 35483079926 — success.
- Original early Canvas/runtime browser head: d3ea03a11345b36b39ab44cdd5f1c6e94640d088.

The evidence workflow head changes CI only; the application code under test is the motion-fabric executable parent.

## Implemented builder capabilities

- Layered background/page composition.
- Procedural Canvas 2D/2.5D world and interactive game variation.
- Image and video binding.
- Clear, glass, and solid page surfaces.
- Reusable scene atoms: orb, ring, beacon, stream, dust.
- Atom motion behaviors: still, drift, float, pulse, orbit.
- Motion profiles: still, calm, drift, kinetic.
- Bounded global motion scale.
- Atom tone, opacity, normalized placement, size, speed and phase.
- Desktop/phone atom visibility.
- Hero and section entrance transitions: none, fade, rise, slide, zoom.
- Bounded transition duration and delay.
- Desktop/phone section visibility.
- Reduced-motion readable fallback.
- Semantic hero/section/navigation/footer authoring.
- Section add/edit/reorder/remove controls.
- Portable .axm.json save/open.
- Project schema v3 with explicit migration receipts.
- SHA-256 source identity verification.
- Shared revisioned AI+human editing session.
- Headless AI CLI over the same reducer.
- Standalone one-file HTML generation without editor code.

## Shared AI + human contract

src/contract/builderSession.js remains the single mutation contract.

New motion commands:
- motion.configure
- scene.compose
- scene.element.add
- scene.element.update
- scene.element.remove
- scene.element.move

Human motion controls emit these same commands. AI does not have a hidden mutation path.

## Schema v3

The v2→v3 migration adds motion profile/scale, scene elements, hero transition, section transitions, and explicit desktop/phone visibility. A v1 source reports v1→v2 followed by v2→v3.

## Fresh evidence

GitHub Actions run 35483079926 passed on the visual-evidence head.

- npm test: 21 project/model/session/motion/AI-CLI tests passed.
- npm run build: passed.
- npm run test:sites: 4/4 passed.
- Standalone front-door review HTML generated from canonical state.
- Settled builder desktop screenshot captured.
- Settled builder phone screenshot captured.
- Settled standalone published desktop screenshot captured.
- Settled standalone published phone screenshot captured.
- builder-visual-review artifact uploaded successfully.

Observed in the settled screenshots:
- motion atoms render in builder and standalone output;
- the desktop-only ring is present on desktop and omitted on phone;
- hero entrance settles to full readable content before visual evidence;
- phone export remains readable and does not depend on desktop navigation.

These screenshots are rendering evidence, not user visual acceptance or production-device performance evidence.

## Failures retained in history

1. Self-contained preview initially treated dollar sequences in the JS bundle as replacement tokens; commit 98667957e3b3b9bb0db14c62d655c7619459455b repaired it.
2. The first standalone example contained an extra closing brace; head d3ea03a11345b36b39ab44cdd5f1c6e94640d088 repaired it and added a parse regression test.
3. Motion-schema run 35482779678 failed because the existing AXM front-door example lacked newly required v3 section transition/visibility fields. Commit 5bfe54013b978cd7b44a78fb97d43b3df03dc696 made the example canonical instead of weakening validation.
4. Motion-render run 35482959033 failed because a test assumed a new scene atom would occupy array index 0 after the front door gained existing atoms. Commit 779bb3d0fbae17d3d77616b2b41884e0b9ac9f29 repaired the test to assert by stable element ID.

## Product boundary

The first AXM front door remains one project made with this builder.

MorphTile patterns remain reusable, but the MorphTile engine is not embedded here. This motion fabric is intentionally a website-animation vocabulary, not a universal graphics/game engine.

## Honest holds

- PR #1 remains draft and unmerged.
- Canvas output remains 2D/2.5D, not WebGL/3D.
- Representative image/video adapters still lack dedicated visual acceptance.
- Production-device performance remains unmeasured.
- Latest motion-fabric visuals have rendering proof but not user visual acceptance.
