# Design QA — World Stage builder

Date: 2026-09-19

Candidate reviewed: remote head `d3ea03a11345b36b39ab44cdd5f1c6e94640d088`

Reference: selected “World Stage” concept with a dark studio shell, narrow scene rail, large cinematic viewport, source/runtime controls, and bottom scene-state strip.

## Comparison

| Area | Reference intent | Observed candidate | Result |
|---|---|---|---|
| Hierarchy | World viewport dominates the editor | Animated viewport remains the clear focal area | Pass |
| Editor anatomy | Top controls, left hierarchy, bottom states | All three regions are present and proportionally similar | Pass |
| Visual language | Deep navy, restrained cyan, green publish action | Palette and luminous edge treatment remain consistent | Pass |
| Page/runtime separation | Site content reads above the world | Navigation, hero, CTA, and footer remain a distinct semantic layer | Pass |
| Surface control | Background may show fully, partly, or not at all | Clear, glass, and solid modes are implemented | Pass |
| Runtime motion | Background must be live, not a static mock | Canvas world and lightcraft animate in the browser | Pass |
| Interactive world | Page must deliberately yield and regain control | Enter/return flow was observed at the exact head | Pass |
| Responsive stage | Composition must remain legible in a narrow canvas | 390 × 844 stage keeps hierarchy, CTA, and safe margins | Pass |
| Published output | Editor chrome must leave the delivery | Standalone page contains the page and runtime, not the editor | Pass |

## Intentional difference

The reference used a highly detailed cinematic image to establish ambition. The candidate uses a deliberately low-poly procedural Canvas 2D scene because the first product contract is lightweight live presentation. It preserves the scale, atmosphere, and luminous city language without claiming the reference image’s realism or full 3D capability.

## Repairs made during QA

- Corrected self-contained review packaging that exposed bundled source text.
- Corrected a standalone runtime syntax error and added a parse regression test.
- Functionalized the desktop/phone resolution control so responsive review is observable.

final result: passed
