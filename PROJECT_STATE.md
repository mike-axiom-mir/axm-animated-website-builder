# Project state

Recorded: 2026-09-20

## Current builder candidate identity

- Draft PR: `mike-axiom-mir/axm-animated-website-builder#1`
- Remote review branch: `world-stage-builder-v0`
- Latest builder executable head: `c96ea779e8cf097bc8f9ca300aa6c30595c98028`
- Latest builder verification: GitHub Actions run `35482189242` — success.
- Original browser-verified Canvas/runtime head: `d3ea03a11345b36b39ab44cdd5f1c6e94640d088`.

The original runtime visual evidence remains valid for that exact historical head. Newer executable heads are tracked separately rather than pretending old screenshots verify new code.

## Implemented in the current builder candidate

- World Stage editor shell.
- Layered background/page composition.
- Procedural Canvas 2D world and interactive game variation.
- Image and video binding.
- Clear, glass, and solid page surfaces.
- Four scene states.
- Desktop and 390 × 844 phone review canvases.
- Published-runtime preview.
- Standalone one-file HTML generation without the editor.
- Semantic hero authoring.
- Section add/edit/reorder/remove controls.
- Per-section surface controls.
- Navigation authoring.
- Footer authoring.
- Portable `.axm.json` builder project save/open.
- Project schema versioning and explicit `v1→v2` migration.
- SHA-256 source identity verification for saved project envelopes.
- Visible source receipts in the editor after save/open.

## Unified AI + human builder session — 2026-09-20

- `src/contract/builderSession.js` is now the single mutation contract for AI and human editing.
- AI command batches are serializable, revision-bound, and atomic.
- Human editor controls emit the same command types instead of mutating project state through a separate path.
- A stale AI batch receives `HOLD_SESSION_REVISION_CONFLICT` instead of overwriting newer human work.
- The browser exposes a Shared session panel with AI batch intake, revision display, recent actor log, and session-context export.
- `scripts/apply-builder-batch.mjs` gives agents a headless CLI path over the same reducer.
- `npm run builder:apply -- input.axm.json ai-batch.json output.axm.json` opens a verified project, applies the AI batch, and writes a new verified project.
- Session history remains editor/session state and is excluded from standalone website output.

## Fresh builder-first evidence

On executable head `c96ea779e8cf097bc8f9ca300aa6c30595c98028`:

- `npm test`: 19 project/model/session/AI-CLI tests passed.
- Project-file round trip is covered.
- Tampered project envelopes are rejected by SHA-256 mismatch.
- Raw v1 projects migrate with an explicit migration receipt.
- `npm run build`: passed.
- `npm run test:sites`: passed.
- AI CLI verified a real input-project → AI batch → output-project round trip.
- GitHub Actions `Verify builder`, run `35482189242`: completed successfully.
- GitHub Actions generated fresh desktop + phone screenshots and uploaded `builder-visual-review`.

## Earlier runtime/browser evidence

- Exact-head editor opened over HTTPS at desktop and phone canvas sizes on the earlier browser-verified candidate.
- Game handoff was observed as `stage` → `stage is-interactive` → `stage`; page-owned return restored control.
- Clear and glass surfaces and multiple scene states were observed.
- Standalone `preview/published.html` opened independently with a live Canvas world.
- No application error was attributed to the final editor/standalone page in that evidence pass.
- Visual comparison is recorded in [`design-qa.md`](design-qa.md).

## Failures retained in history

1. The first self-contained editor preview treated `$` sequences in the JavaScript bundle as replacement tokens and exposed source text. Commit `98667957e3b3b9bb0db14c62d655c7619459455b` repaired the generator.
2. The first standalone example contained one extra closing brace. Browser evidence showed a page-level `SyntaxError`; head `d3ea03a11345b36b39ab44cdd5f1c6e94640d088` removed it and added a parse regression test.

## First real AXM front-door continuation

- Front-door project: `src/projects/axmFrontDoor.js`.
- Real use exposed semantic sections/navigation and per-section surfaces.
- Those findings have now been fed back into actual builder authoring controls instead of remaining render-only data.
- The front door remains downstream of the builder: it is one project, not a special-case engine path.
- MorphTile remains a reusable pattern/source boundary; its engine is not embedded here.

## Honest holds

- PR #1 remains draft and unmerged.
- Fresh browser visual verification of the new authoring controls is still open.
- The scene remains Canvas 2D/2.5D, not full 3D or WebGL.
- Image/video adapters are structurally implemented, but representative media files still lack visual acceptance.
- Production-device performance remains unmeasured.
- The AXM front-door continuation still lacks fresh user visual acceptance.
