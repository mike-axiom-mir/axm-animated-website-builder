# Project state

Recorded: 2026-09-19T22:42:17Z

## Verified candidate identity

- Draft PR: `mike-axiom-mir/axm-animated-website-builder#1`
- Remote review branch: `world-stage-builder-v0`
- Executable evidence head: `d3ea03a11345b36b39ab44cdd5f1c6e94640d088`
- Executable evidence tree: `75f7088b42342f2e9cdcbd2a9fc5d4529edd7577`
- Local commit: `a15a99287346c44212ea73be81900fc143080226`
- Local tree: `75f7088b42342f2e9cdcbd2a9fc5d4529edd7577`

The local and remote executable commit identities differ because the connected GitHub writer created the remote commits, but their executable content tree is byte-identical. This record lives in a documentation-only successor of the verified code head; read the branch ref for the current documentation commit identity.

## Implemented in the candidate

- World Stage editor shell.
- Layered background/page composition.
- Procedural Canvas 2D world and interactive game variation.
- Image and video binding.
- Clear, glass, and solid page surfaces.
- Four scene states.
- Desktop and 390 × 844 phone review canvases.
- Published-runtime preview.
- Standalone one-file HTML generation without the editor.

## Fresh evidence

- `npm test`: 5/5 project/export tests passed.
- `npm run build:review`: production client, Worker package, self-contained editor review, and standalone example generated.
- `npm run test:sites`: 4/4 Worker/package tests passed.
- GitHub Actions `Verify builder`, run `35474050818`: completed successfully on the exact remote head.
- Exact-head editor opened over HTTPS in the cloud browser at desktop and phone canvas sizes.
- Game handoff observed as `stage` → `stage is-interactive` → `stage`; the page-owned return control restored `stage` and the ready state.
- Clear and glass surfaces and multiple scene states were observed.
- Standalone `preview/published.html` opened independently. Its canvas resized to 1363 × 936 and rendered the animated low-poly scene.
- No application error was emitted by the final editor or standalone page. The browser emitted unrelated metadata errors from its own extension; those were not attributed to the site.
- Visual comparison is recorded in [`design-qa.md`](design-qa.md).

## Failures retained in history

1. The first self-contained editor preview treated `$` sequences in the JavaScript bundle as string-replacement tokens and exposed source text in the page. Commit `98667957e3b3b9bb0db14c62d655c7619459455b` repaired the generator by using function replacements.
2. The first standalone example contained one extra closing brace. Browser evidence showed a page-level `SyntaxError`; head `d3ea03a11345b36b39ab44cdd5f1c6e94640d088` removed it and added a parse regression test.

## Honest holds

- The draft PR is not merged; user visual acceptance remains open.
- The scene is Canvas 2D/2.5D, not full 3D or WebGL.
- Image/video adapters are structurally implemented, but representative media files have not yet been visually accepted.
- Performance has not been measured across production devices.
- This is not yet the AXM front-door website; it is the builder proof that can create it.
