# AI builder contract

## Goal

The Animated Website Builder is callable without giving AI a private or privileged editor path.

AI, human controls, and mixed human+AI sessions all mutate the same canonical project through the same deterministic command contract.

## Command batch

An AI submits a serializable batch:

```json
{
  "format": "axm-builder-command-batch",
  "version": 1,
  "baseRevision": 0,
  "actor": {
    "type": "ai",
    "id": "website-designer"
  },
  "label": "Create landing page",
  "commands": []
}
```

`baseRevision` is mandatory. If the human has edited revision 0 into revision 1 before the AI batch lands, the AI batch receives `HOLD_SESSION_REVISION_CONFLICT` instead of overwriting the human.

A batch is atomic: either every command produces a valid project or none of the commands land.

## Current commands

- `set` — bounded scalar/project fields.
- `background.configure` — scene type/state/seed/motion/atmosphere/media source.
- `hero.configure` — hero copy and surface.
- `section.add`
- `section.update`
- `section.remove`
- `section.move`
- `navigation.add`
- `navigation.update`
- `navigation.remove`
- `page.compose` — efficient whole semantic-page composition for AI.

Unknown command types and unapproved `set` paths become explicit HOLD results.

## AI-friendly whole page example

```json
{
  "format": "axm-builder-command-batch",
  "version": 1,
  "baseRevision": 0,
  "actor": { "type": "ai", "id": "website-designer" },
  "label": "First composition",
  "commands": [
    {
      "type": "background.configure",
      "payload": {
        "state": "explore",
        "seed": 44,
        "motion": true,
        "atmosphere": 80
      }
    },
    {
      "type": "page.compose",
      "payload": {
        "hero": {
          "eyebrow": "LIVING WEBSITE",
          "title": "A site composed as state, not a screenshot.",
          "action": "Explore",
          "surface": "clear"
        },
        "navigation": [
          { "label": "Why", "href": "#why" }
        ],
        "sections": [
          {
            "id": "why",
            "eyebrow": "WHY",
            "title": "Animation stays behind readable content.",
            "body": "The AI can shape the world and semantic page without taking ownership of navigation or accessibility.",
            "surface": "glass",
            "points": ["Portable state", "Inspectable commands"]
          }
        ],
        "footer": {
          "left": "HUMAN + AI",
          "right": "ONE BUILDER CONTRACT"
        }
      }
    }
  ]
}
```

## CLI use

An agent with filesystem access can apply a batch without opening the human UI:

```bash
npm run builder:apply -- input.axm.json ai-batch.json output.axm.json
```

The CLI opens and verifies the input project, creates a builder session, applies the exact same batch reducer used by the browser, and writes a new verified `.axm.json` project.

## Shared browser session

The editor contains a Shared session panel.

- Human controls emit human command batches.
- AI JSON can be pasted into the same session.
- Both increment one shared revision.
- The recent action log records actor type, revision and batch label.
- The session context can be exported for an AI.
- The collaboration log is session state only; it is not bundled into the published website.

## Truth boundary

A successfully applied AI batch proves deterministic state mutation. It does **not** prove visual quality. Screenshot/runtime acceptance remains a separate evidence step.
