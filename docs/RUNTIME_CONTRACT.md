# Background runtime contract

Every background adapter must satisfy these rules.

## Required behavior

1. Fill its assigned viewport and respond to resize.
2. Accept serializable source and state from the project.
3. Remain decorative and non-blocking by default.
4. Receive user input only after explicit handoff.
5. Release user input immediately when the page requests it.
6. Stop listeners, animation frames, media playback, and other resources when unmounted.
7. Expose missing or unsupported sources as an explicit HOLD.
8. Provide a lightweight presentation path for export.

## Authority

The page layer owns navigation, reading, forms, and normal pointer/keyboard input. An interactive runtime may temporarily own gameplay input, but a page-owned exit control must remain reachable.

## Evidence levels

- A valid project shape is structural evidence.
- A successful production build is build evidence.
- A browser screenshot is visual evidence for that exact state.
- Repeated interaction observed in the browser is runtime evidence.
- None of these alone proves performance on every device.
