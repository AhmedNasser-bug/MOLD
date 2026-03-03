# Implementation Plan: Master Problem List Refactor

**Branch**: `master` | **Date**: 2026-03-03
**Input**: Feature specification from User Input (58-point Master Problem List)

## Summary

The primary requirement is to execute a massive stabilization and technical debt remediation effort across the codebase. We will address 58 identified problems prioritized by severity (P0-P3). The immediate technical approach will focus on resolving P0 and P1 issues: eliminating severe memory leaks in screen controllers, adding automatic EventBus subscription teardown, moving away from global `window.subjectData` pollution, implementing the Unit of Work pattern for transaction safety, and establishing a unified API facade to strictly enforce our layering principles.

## Technical Context

**Language/Version**: TypeScript 5.9
**Primary Dependencies**: Astro 5.16.6, @sqlite.org/sqlite-wasm 3.51.1, Zod 3.25.76
**Storage**: SQLite WASM (Local-First)
**Testing**: NEEDS CLARIFICATION (Currently no testing framework listed, need to establish one for Unit & DB tests)
**Target Platform**: Web Browsers (Mobile-first offline PWA)
**Project Type**: Web application (SSG + Client Hydration)
**Performance Goals**: Zero memory leaks per session, < 200ms startup time, 0 orphaned listeners
**Constraints**: strictly offline-first, local SQLite state, seamless mode transitions
**Scale/Scope**: 58 prioritized issues, widespread architectural impact across 8+ screens and all repositories.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Does this plan adhere to the **Offline-First Architecture** and **Database-First Strategy**?
- [x] Are structural changes aligned with the **Strict Layering** (UI, Logic, Infrastructure) and **Repository Pattern (DIP)**?
- [x] Does the UI employ **Component Composition** and **Event Orchestration** (no monolithic controllers)?
- [x] Is the design optimized for the designated **UX & UI Choices** (Centered focus, premium aesthetic, reachable controls)?

## Project Structure

### Documentation (this feature)

```text
specs/master/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── data/
├── infrastructure/
│   ├── db/
│   │   ├── migrations/
│   │   ├── repositories/
│   │   └── UnitOfWork.ts      # [NEW] To handle transaction safety (Issue #9)
│   ├── errors/                # [NEW] Standardized error handling (Issue #12)
│   └── events/
│       └── EventBus.ts        # [UPDATED] Add auto-unsubscribe logic (Issue #2)
├── interfaces/
├── layouts/
├── logic/
│   ├── models/
│   │   └── Subject.ts         # [UPDATED] Merge dual implementations (Issue #8)
│   ├── state/                 # [NEW] Scoped state management replacing window object (Issue #3)
│   └── api/                   # [NEW] API Facade to prevent direct repo access (Issue #10)
├── pages/
├── scripts/
├── storage/
├── styles/
├── tests/                     # [NEW] Establish testing framework
└── ui/
    ├── components/
    ├── controllers/
    │   └── BaseScreenController.ts # [UPDATED] Implement onDestroy lifecycle (Issue #1)
    ├── managers/
    │   └── ScreenManager.ts        # [UPDATED] Call engine/controller destroy on switch (Issue #5)
    ├── registry/
    │   └── ComponentRegistry.ts    # [UPDATED] Add registry.clear() (Issue #4)
    └── screens/
```

**Structure Decision**: We maintain the existing Web Application structure but heavily refactor `infrastructure/` and `logic/` to introduce the missing API Facade, Unit of Work, and Scoped State layers.
