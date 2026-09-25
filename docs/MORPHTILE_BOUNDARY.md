# MorphTile relationship

MorphTile and this builder are both AXM-owned. AXM may reuse either codebase. The current separation is a product and delivery decision, not a licensing barrier.

## Reused now

- one canonical matter/project state read by multiple surfaces;
- presentation state separated from temporary session state;
- portable plain data;
- explicit HOLD results when a source cannot be truthfully presented; and
- simple controls as lenses over the underlying state rather than copied values.

## Not embedded now

The MorphTile engine is not bundled into the editor or standalone export. Its recursive tiles, merge ledger, rasterizer, commerce rules, and workshop are beyond this builder proof’s needs and would increase presentation cost.

## Future adapter

A MorphTile background should be added only when a real website needs a portable MorphTile world. It belongs behind the same runtime boundary and should provide its own lightweight published interpreter. It must not centralize domain-specific building, character, animal, or environment semantics in this repository.
