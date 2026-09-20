# Builder project files

## Purpose

A builder project must be portable without making file loading a silent trust boundary.

The current project-file format is:

- envelope format: `axm-animated-site-project`;
- envelope version: `1`;
- current project schema: `2`; and
- content identity: SHA-256 over the canonical serialized project.

Files are downloaded with the `.axm.json` suffix.

## Save path

`buildProjectFile(project)` first migrates/normalizes the current project into the active schema, validates it, serializes it canonically, and computes the SHA-256 identity.

The saved envelope contains:

```json
{
  "format": "axm-animated-site-project",
  "fileVersion": 1,
  "projectSha256": "...",
  "project": {}
}
```

## Open path

`parseProjectFile(text, { sourceName })` follows these rules:

1. malformed JSON is a HOLD;
2. unknown envelope formats are a HOLD;
3. unsupported envelope versions are a HOLD;
4. the stored SHA-256 must match the contained project before migration;
5. newer-than-supported project schemas are a HOLD;
6. supported older schemas migrate explicitly; and
7. validation runs again after migration.

The returned receipt records the SHA-256, source name, source schema version, whether the envelope identity was verified, and any migrations.

## Legacy raw project JSON

Raw `axm-animated-site` JSON can still be opened for migration. Because it has no saved envelope identity, the receipt is marked `verified: false` even though the builder computes a SHA-256 for that source text representation.

This is compatibility, not equivalent evidence to a verified envelope.

## Current migration

Schema `v1 → v2` adds the semantic-page defaults required by real builder use:

- `page.heroNote`;
- `page.navigation`;
- `page.sections`; and
- `page.footer`.

Migration does not silently claim that the old project originally contained those values; the open receipt reports the migration.
