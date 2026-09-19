# Architecture

## The two-layer composition

```text
Editor (authoring only)
  └─ Project JSON
      ├─ Background runtime adapter
      │   └─ world | video | image | game
      └─ Semantic page layer
          └─ clear | glass | solid surfaces

Standalone export
  └─ Project JSON + selected presentation runtime + page HTML/CSS
```

The page and the background share project state, not DOM ownership. This prevents a game or animation from becoming the only way to navigate or read the site.

## Canonical project state

`src/model/project.js` owns the serializable project shape. Editor controls update that object. Runtime preview and export both read it. There is no second simplified “published” model.

Session-only state—open rail, preview mode, game input ownership, and notices—does not enter the exported project.

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

`src/export/exportSite.js` compiles a single HTML file with the chosen background runtime and semantic overlay. It does not include React, the editor rail, or authoring controls.
