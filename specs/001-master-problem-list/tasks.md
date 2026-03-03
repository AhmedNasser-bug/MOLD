---
description: "Master Problem List Implementation Tasks"
---

# Tasks: Master Problem List & Architecture Stabilization

**Input**: Design documents from `specs/001-master-problem-list/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story, following the Strict Layering and Component Composition principles of the project's constitution. The goal is to aggressively resolve P0/P1 memory leaks and transaction safety issues first.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vitest configuration and base setup in `vitest.config.ts` per `research.md` decision
- [x] T002 [P] Create testing folder structure `src/tests/` and setup basic mocking for `sqlite-wasm`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement `src/infrastructure/errors/DatabaseError.ts` and `ValidationError.ts` (Issue #12)
- [x] T004 Implement `src/infrastructure/db/UnitOfWork.ts` to manage transaction boundaries (Issue #9)
- [x] T005 Implement `src/logic/api/BaseApiFacade.ts` to establish the API gateway layer (Issue #10)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - System Stability & Memory Management (Priority: P1) 🎯 MVP

**Goal**: Play consecutive game sessions without browser tab crashing; memory leaks patched.
**Independent Test**: Play 10 consecutive game sessions and verify memory footprints using Browser DevTools.

### Implementation for User Story 1

- [x] T006 [P] [US1] Update `src/infrastructure/events/EventBus.ts` to add cleanup tracking & auto-unsubscribe methods (Done by Jules/BaseScreen)
- [x] T007 [P] [US1] Implement Scoped State Store in `src/logic/state/SubjectState.ts` to replace global `window.subjectData`
- [x] T008 [US1] Update `src/ui/registry/ComponentRegistry.ts` to include a `.clear()` method (Done by Jules)
- [x] T009 [US1] Update `src/ui/controllers/BaseScreenController.ts` to implement strict `onDestroy()` abstraction (Done by Jules)
- [x] T010 [US1] Update `src/ui/managers/ScreenManager.ts` to call controller `onDestroy()` and registry `.clear()` before routing
- [x] T011 [US1] Apply `onDestroy()` memory cleanup (Event listeners, GameEngine instances) to `HomeScreen.astro`
- [x] T012 [P] [US1] Apply `onDestroy()` to remaining game screens (Quiz, Flashcards, etc.) (Delegated to Jules CLI autonomy rule)

**Checkpoint**: At this point, User Story 1 should be fully functional and memory leaks eliminated.

---

## Phase 4: User Story 2 - Transactional Data Integrity (Priority: P1)

**Goal**: Prevent data corruption during multi-step database saves.
**Independent Test**: Simulate database write failure mid-transaction and verify no partial stats commit.

### Tests for User Story 2 ⚠️

- [x] T013 [P] [US2] Write unit tests in `src/tests/transactions.test.ts` to simulate simulated mid-save DB failures

### Implementation for User Story 2

- [x] T014 [US2] Update `src/infrastructure/db/repositories/` to support being orchestrated by `UnitOfWork`
- [x] T015 [US2] Wrap multi-repo mutation operations (e.g., answering a question) inside `UnitOfWork.begin()` and `commit()`
- [x] T016 [US2] Add Zod runtime validation to `src/logic/api/` to reject malformed data before hitting repositories

**Checkpoint**: UnitOfWork and transactional boundaries are strictly enforced.

---

## Phase 5: User Story 3 - API & Component Decoupling (Priority: P2)

**Goal**: Unified API facade preventing direct repository usage from UI components.
**Independent Test**: Assert zero imports from `infrastructure/db/repositories` exist inside `src/ui/`.

### Implementation for User Story 3

- [x] T017 [P] [US3] Implement concrete API classes like `src/logic/api/PlayerApi.ts` and `src/logic/api/ScoreApi.ts`
- [x] T018 [US3] Refactor all UI components in `src/ui/components/` to replace direct Repository instantiations with API Facade calls
- [x] T019 [P] [US3] Implement DB Migration caching in memory so migrations run strictly once per application lifecycle

**Checkpoint**: All user stories should now be independently functional. The UI is completely decoupled from DB implementations.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T020 Refactor dual `Subject` class implementations (`src/data/subjects/Subject.ts` vs duplicated ones) into a single entity (Issue #8)
- [x] T021 Run final integration checks against Astrol/TS compiler (Resolve the remaining 98 Type Errors from the architectural shift)
- [x] T022 Document usage of the new `API Facade` and `UnitOfWork` in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - P1 user stories (US1, US2) can proceed sequentially or concurrently if domains don't overlap.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- T006, T007 (EventBus and SubjectState) can be written simultaneously.
- T012 (Applying onDestroy to various screens) can be distributed among team members (Jules).
- T017 (Building concrete API classes) can be parallelized with US2 tasks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Vitest)
2. Complete Phase 2: Foundational (Error borders, UOF structure)
3. Complete Phase 3: User Story 1 (Memory cleanup)
4. **STOP and VALIDATE**: Monitor memory in browser. If Stable, proceed to transaction safety.
