# Implementation Plan: Refactoring window.game Global Usage

**Branch**: `002-refactor-window-game` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/master/002-refactor-window-game/spec.md`

## Summary

Refactor 6 Challenge/Practice screens, the Home screen, Results screen, and Revision screen to use the existing `EventBus` and `ScreenManager` patterns. This completely purges global `window.game` assignments to prevent memory leaks and decouple internal game logic. Add a static analysis rule to enforce prevention.

## Technical Context

**Language/Version**: TypeScript / Astro  
**Primary Dependencies**: Vanilla TS / Internal EventBus  
**Storage**: N/A  
**Testing**: ESLint (custom rule)  
**Target Platform**: Web Browser  
**Project Type**: Web Application  
**Performance Goals**: Eliminate memory leaks by ensuring proper listener cleanup  
**Constraints**: Must match the exact transition logic currently implemented via global callbacks  
**Scale/Scope**: 12 specific front-end files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No violations. The project constitution relies on maintaining clean state and component encapsulation. Removing `window.game` brings the rest of the application into alignment with the `SpeedrunScreen` standard architecture.

## Project Structure

### Documentation (this feature)

```text
specs/master/002-refactor-window-game/
├── plan.md              # This file
├── research.md          # Output of Phase 0
├── data-model.md        # Output of Phase 1
└── quickstart.md        # Output of Phase 1
```

### Source Code (repository root)

```text
src/
├── ui/
│   ├── screens/
│   │   ├── challenge-screens/
│   │   │   ├── BlitzScreen.astro
│   │   │   ├── ExamScreen.astro
│   │   │   ├── HardcoreScreen.astro
│   │   │   └── SpeedrunScreen.astro
│   │   ├── practice-screens/
│   │   │   ├── FlashcardScreen.astro
│   │   │   └── PracticeScreen.astro
│   │   ├── HomeScreen.astro
│   │   ├── ResultsScreen.astro
│   │   ├── RevisionScreen.astro
│   │   └── AchievementsScreen.astro
│   ├── components/
│   │   └── BackButton.astro
│   └── registry/
│       └── ComponentRegistry.ts
```

**Structure Decision**: Operating strictly within the existing `/src/ui/screens` directory framework. No new architectural folders required.

## Complexity Tracking

N/A - Standardizes existing complexity rather than introducing new paradigms.
