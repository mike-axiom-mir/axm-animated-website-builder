# Project state

Recorded: 2026-09-20

## Current candidate identity

- Draft PR: mike-axiom-mir/axm-animated-website-builder#1
- Remote review branch: world-stage-builder-v0
- Section-choreography executable head: 7f612294e005a0a1082ca665d0d8e22c079e5af4
- GitHub Actions verification: run 35485484774 — success.
- Current main/base reconciled at 75ee8df621d977612862050487debe1f4f834848.
- Earlier motion-fabric baseline: 779bb3d0fbae17d3d77616b2b41884e0b9ac9f29.

## Implemented builder capabilities

- Layered background/page composition.
- Procedural Canvas 2D/2.5D world and interactive game variation.
- Image and video binding.
- Clear, glass, and solid page surfaces.
- Reusable scene atoms: orb, ring, beacon, stream, dust.
- Atom motion behaviors: still, drift, float, pulse, orbit.
- Motion profiles: still, calm, drift, kinetic.
- Bounded global motion scale.
- Atom tone, opacity, normalized placement, size, speed, phase and desktop/phone visibility.
- Hero and section entrance transitions: none, fade, rise, slide, zoom.
- Desktop/phone section visibility.
- Reduced-motion readable fallback.
- Semantic hero/section/navigation/footer authoring.
- Portable .axm.json save/open with SHA-256 source identity.
- Shared revisioned AI+human editing session.
- Headless AI CLI over the same reducer.
- Standalone one-file HTML generation without editor code.

## Section-driven world choreography

Project schema v4 adds scroll-driven semantic scene cues.

Each hero/section can select a reusable recipe:
- inherit
- calm-intro
- product-reveal
- technical
- cinematic
- playful

A scene cue can override:
- scene state;
- motion profile and scale;
- atmosphere;
- atom intensity;
- camera pan X/Y and zoom; and
- blend duration.

The visitor's scroll does not mutate canonical project state. The runtime selects the semantic hero/section nearest the viewing focus, resolves its recipe, and eases continuous renderer state toward the target.

Human controls and AI commands use the same contract:
- choreography.configure
- hero.choreograph
- section.choreograph

The AXM front-door acceptance project currently uses:
- hero → calm-intro
- Why → product-reveal
- Method → technical
- Workshop → cinematic
- Roots → calm-intro

## Schema v4

The v3→v4 migration adds page choreography configuration, hero scene cue and per-section scene cues.

Migration receipts remain explicit:
- v1 reports v1→v2 → v2→v3 → v3→v4
- v2 reports v2→v3 → v3→v4
- v3 reports v3→v4

## Fresh evidence

GitHub Actions run 35485484774 passed on executable head 7f612294e005a0a1082ca665d0d8e22c079e5af4.

- npm test: 23/23 passed.
- npm run build: passed.
- npm run test:sites: 4/4 passed.
- Standalone review HTML generated from canonical project state.
- Builder desktop screenshot captured.
- Builder phone screenshot captured.
- Published hero desktop screenshot captured.
- Published hero phone screenshot captured.
- Published #workshop desktop screenshot captured after choreography settling.
- builder-visual-review artifact uploaded successfully.

Observed in the rendered evidence:
- hero renders the calm-intro world;
- the Workshop anchor renders with the darker/tighter cinematic world state behind semantic content;
- section content remains readable while the world changes beneath it;
- phone editor remains usable and no longer shows the earlier clipped Bind local media text;
- choreography remains present in standalone output, not only editor preview.

These are rendering/runtime evidence, not production-device performance measurements or final user visual acceptance.

## Main/license reconciliation

New licensing commits landed on main while the builder PR was growing. That removed the PR merge ref and temporarily stopped pull-request Actions runs.

The branch was reconciled with current main in 7f612294e005a0a1082ca665d0d8e22c079e5af4 without dropping choreography work.

Current licensing boundary preserved from main:
- PolyForm Noncommercial 1.0.0 for the builder machine/workshop;
- CREATOR_OUTPUT_PERMISSION.md for commercial Creator Output;
- LICENSE_BOUNDARY.md for the current boundary and historical-grant continuity.

After reconciliation PR #1 returned to clean/mergeable state and GitHub Actions resumed.

## Failures retained in history

1. Self-contained preview initially treated dollar sequences in the JS bundle as replacement tokens; commit 98667957e3b3b9bb0db14c62d655c7619459455b repaired it.
2. The first standalone example contained an extra closing brace; head d3ea03a11345b36b39ab44cdd5f1c6e94640d088 repaired it and added a parse regression test.
3. Motion-schema run 35482779678 failed because the existing AXM front-door example lacked newly required v3 fields. Commit 5bfe54013b978cd7b44a78fb97d43b3df03dc696 made the example canonical instead of weakening validation.
4. Motion-render run 35482959033 failed because a test assumed a new scene atom would occupy array index 0. Commit 779bb3d0fbae17d3d77616b2b41884e0b9ac9f29 repaired the test to assert by stable element ID.
5. Section-choreography commits initially produced no new PR runs because main had advanced four licensing commits and GitHub removed the PR merge ref. Merge commit 7f612294e005a0a1082ca665d0d8e22c079e5af4 reconciled current main and restored the verification lane.

## Product boundary

The first AXM front door remains one project made with this builder.

MorphTile patterns remain reusable, but the MorphTile engine is not embedded here. The choreography system is deliberately a website-animation vocabulary, not a universal graphics/game engine.

## Honest holds

- PR #1 remains draft and unmerged.
- Canvas output remains 2D/2.5D, not WebGL/3D.
- Representative image/video adapters still lack dedicated visual acceptance.
- Production-device performance remains unmeasured.
- Section choreography has automated rendering evidence but still needs user visual acceptance.
