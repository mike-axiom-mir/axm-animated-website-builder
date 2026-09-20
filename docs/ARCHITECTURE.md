# Architecture

## The two-layer composition

```text
Editor (authoring only)
  └─ Canonical project state
      ├─ Background runtime adapter
      │   └─ world | video | image | game
      └─ Semantic page layer
          ├─ hero
          ├─ navigation
          ├─ sections
          └─ clear | glass | solid surfaces

Portable project file
  └─ verified envelope
      ├─ project schema version
      ├─ SHA-256 content identity
      └─ canonical project state

Standalone export
  └─ canonical project state + selected presentation runtime + page HTML/CSS
```

The page and the background share project state, not DOM ownership. This prevents a game or animation from becoming the only way to navigate or read the site.

## Canonical project state

`src/model/project.js` owns the serializable project shape and current schema version. Editor controls update that object. Runtime preview, project save/open, and standalone export all read the same state.

The builder does not maintain a second simplified “published” model.

Session-only state—open rail, preview mode, game input ownership, notices, and the currently opened file receipt—does not enter the published site.

## Authoring controls

`src/editor/PageControls.jsx` is the first extracted authoring surface for semantic page data. It edits:

- hero copy;
- section order and copy;
- section bullet points;
- per-section surfaces;
- navigation items; and
- footer copy.

The first front-door project exposed these needs, but the controls remain generic builder capability.

## Project files

Project save/open is not a raw JSON trust path. The builder writes a versioned envelope containing the canonical project and its SHA-256 content identity.

When a file is opened:

1. the envelope identity is verified before state is accepted;
2. unsupported/newer formats become explicit HOLD results;
3. older supported project schemas migrate explicitly; and
4. the UI receives a source receipt describing the source hash and any migration.

See `docs/PROJECT_FILES.md`.

## Runtime adapters

`BackgroundRuntime` selects the active renderer. The current adapters are deliberately small:

| Adapter | Current implementation | Input |
|---|---|---|
| `world` | Deterministic animated Canvas 2D low-poly scene | none |
| `game` | Same canvas with a keyboard-controlled lightcraft | explicit handoff |
| `video` | Native muted looping video | local media data URL |
| `image` | Native image layer | local media data URL |

A future WebGL/MorphTile adapter should enter through this boundary instead of taking over the page.

## Export boundary

`src/export/exportSite.js` compiles a single HTML file with the chosen background runtime and semantic overlay. It does not include React, the editor rail, project-file controls, or authoring controls.
