---
name: add-mini-game
description: Scaffold a new mini game in this repo and wire it into the index.
disable-model-invocation: true
argument-hint: "--name <kebab-case> --title <title>"
---

Goal: add a new game under `games/<name>/` and ensure it is linked from the root index.

Steps:
1) Run the scaffold command:
   - `npm run new -- --name <kebab-case> --title <title>`
2) Verify it appears in `games/<name>/game.json`.
3) Run `npm run build` and then `npm run dev`.
4) Confirm the root page links to the new game.

Notes:
- Keep games self-contained (no shared runtime dependencies unless explicitly requested).
- Prefer Canvas + plain DOM APIs.
