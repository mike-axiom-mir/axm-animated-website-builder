# Builder project files

## Purpose

A builder project must be portable without making file loading a silent trust boundary.

Current format:
- envelope: axm-animated-site-project
- envelope version: 1
- project schema: 3
- identity: SHA-256 over canonical serialized project
- file suffix: .axm.json

## Save and open

buildProjectFile first migrates and normalizes into the active schema, validates the project, serializes it canonically, and computes the SHA-256 identity.

parseProjectFile rejects malformed JSON, unknown envelope formats, unsupported envelope versions, identity mismatches, and newer-than-supported schemas. Supported older schemas migrate explicitly and validation runs again after migration.

The returned receipt records SHA-256, source name, source schema version, whether the envelope identity was verified, and every migration that occurred.

## Legacy raw project JSON

Raw axm-animated-site JSON can still be opened for migration. Because it has no saved envelope identity, the receipt is marked verified: false. This compatibility path is not equivalent evidence to a verified envelope.

## Migrations

### v1 → v2

Adds semantic-page defaults:
- page.heroNote
- page.navigation
- page.sections
- page.footer

### v2 → v3

Adds reusable motion and responsive state:
- background.motionProfile
- background.motionScale
- background.sceneElements
- page.heroTransition
- per-section transition
- per-section desktop/phone visibility
- per-scene-element desktop/phone visibility

A v1 source reports both v1→v2 and v2→v3. Migration does not claim the old project originally contained the new fields; the receipt reports the change explicitly.
