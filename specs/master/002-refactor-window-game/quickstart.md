# Quickstart: Testing the Refactor

This guide details how to verify the system post-migration.

## 1. Verifying Memory Leaks
1. Launch the dev server: `pnpm run dev`
2. Open the browser dev tools (Memory Tab).
3. Navigate from Home -> Speedrun -> Home -> Hardcore.
4. Verify event listeners attached to the window remain constant, indicating `onDestroy()` correctly unsubscribed `EventBus` listeners.

## 2. Verifying Lint Enforcement
To test the custom ESLint rule:
1. Open any file in `src/ui/screens/`.
2. Temporarily add: `window.game = {};`.
3. Try committing or running `pnpm run lint`. The process should immediately fail explicitly citing `window.game` is restricted.
