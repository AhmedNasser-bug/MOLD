# Phase 0: Research & Pattern Discovery

All `NEEDS CLARIFICATION` markers resolved.

## Investigation: SpeedrunScreen Pattern
- **Decision**: All 6 remaining screens will adopt `BaseScreenController` extension.
- **Rationale**: `SpeedrunScreen` successfully utilizes `componentRegistry` instead of polling, and subscribes to `eventBus` inside `onInit()`, deregistering inside `onDestroy()`. This is exactly the target architecture.
- **Alternatives**: Using React/Svelte state management. *Rejected*: Project actively uses Vanilla TS/Astro class instances.

## Investigation: ESLint Enforcement
- **Decision**: Add a localized `.eslintrc` override or root rule using `no-restricted-properties`.
- **Rationale**: `no-restricted-properties` can explicitly target `property: "game", object: "window"`.
- **Alternatives**: Custom AST plugin. *Rejected*: Too complex; standard rules suffice.
