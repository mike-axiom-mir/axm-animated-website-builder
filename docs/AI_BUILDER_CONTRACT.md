# AI builder contract

## Goal

The Animated Website Builder is callable without giving AI a private or privileged editor path. AI, human controls, and mixed sessions all mutate the same canonical project through one deterministic contract.

## Command batch

Required fields:
- format: axm-builder-command-batch
- version: 1
- baseRevision: current session revision
- actor.type: ai for AI batches
- actor.id: caller identity
- label: human-readable purpose
- commands: atomic command array

A stale baseRevision receives HOLD_SESSION_REVISION_CONFLICT instead of overwriting newer work. A batch is atomic: either every command produces a valid canonical project or none land.

## Current commands

Semantic/page:
- set
- hero.configure
- section.add
- section.update
- section.remove
- section.move
- navigation.add
- navigation.update
- navigation.remove
- page.compose

World/motion:
- background.configure
- motion.configure
- scene.compose
- scene.element.add
- scene.element.update
- scene.element.remove
- scene.element.move

Section updates can carry transition and desktop/phone visibility. Scene elements can carry type, normalized placement, size, opacity, motion behavior, speed, phase, tone and responsive visibility.

Unknown command types and unapproved set paths become explicit HOLD results.

## Headless CLI

Command:

npm run builder:apply -- input.axm.json ai-batch.json output.axm.json

The CLI opens and verifies the input project, creates a builder session, applies the exact same reducer used by the browser, and writes a new verified .axm.json project.

## Shared browser session

- Human controls emit human command batches.
- AI JSON can be pasted into the same session.
- Both increment one shared revision.
- Recent history records actor type, revision and batch label.
- Session context can be exported for another AI.
- Collaboration history is not bundled into the published website.

## Truth boundary

A successfully applied AI batch proves deterministic state mutation. It does not prove visual quality.

GitHub Actions now produces separate settled visual evidence after tests/build:
- builder desktop
- builder phone
- standalone published desktop
- standalone published phone

Production-device performance remains a separate measurement.
