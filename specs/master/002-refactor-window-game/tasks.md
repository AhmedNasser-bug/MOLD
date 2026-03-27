# Tasks: Refactoring window.game Global Usage

**Input**: Design documents from `/specs/master/002-refactor-window-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No setup tasks required. Project already initialized and EventBus/BaseScreenController already exist).*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

*(No foundational blockers. Screen controllers can be iteratively migrated in parallel).*

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Standardized Pattern for Challenge & Practice Screens (Priority: P1) 🎯 MVP

**Goal**: Migrate all active core gameplay screens to the `BaseScreenController` EventBus pattern to prevent memory leaks.

**Independent Test**: Load each of the 5 modes independently from the current `HomeScreen` and ensure they play through without errors, then verify no listeners are left behind on teardown.

### Implementation for User Story 1

- [ ] T001 [P] [US1] Refactor `PracticeScreen` to use EventBus in `src/ui/screens/practice-screens/PracticeScreen.astro`
- [ ] T002 [P] [US1] Refactor `FlashcardScreen` to use EventBus in `src/ui/screens/practice-screens/FlashcardScreen.astro`
- [ ] T003 [P] [US1] Refactor `HardcoreScreen` to use EventBus in `src/ui/screens/challenge-screens/HardcoreScreen.astro`
- [ ] T004 [P] [US1] Refactor `ExamScreen` to use EventBus in `src/ui/screens/challenge-screens/ExamScreen.astro`
- [ ] T005 [P] [US1] Refactor `BlitzScreen` to use EventBus in `src/ui/screens/challenge-screens/BlitzScreen.astro`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Modernized Home Screen Routing (Priority: P1)

**Goal**: Ensure the Home Screen triggers mode changes exclusively through the EventBus architecture instead of having 8 different direct method assignments.

**Independent Test**: Click "Initialize Challenge" for all configurations on the Setup Panel and verify the correct screen activate events are fired and intercepted.

### Implementation for User Story 2

- [ ] T006 [US2] Refactor mode launchers to emit `game:start` events in `src/ui/screens/HomeScreen.astro`
- [ ] T007 [US2] Update `AchievementsScreen` to use EventBus navigation in `src/ui/screens/AchievementsScreen.astro`
- [ ] T008 [US2] Update `BackButton` component to use EventBus navigation in `src/ui/components/BackButton.astro`

**Checkpoint**: Home Screen routing is decoupled. US1 and US2 are completely functional.

---

## Phase 5: User Story 3 - Clean Results and Revision Flow (Priority: P2)

**Goal**: The end-of-game flows reliably receive and process game data independently of global window objects.

**Independent Test**: Ensure completing a game successfully navigates the user to the correct Results screen with the accurate final score using payloads.

### Implementation for User Story 3

- [ ] T009 [P] [US3] Refactor `ResultsScreen` to parse incoming EventBus payloads in `src/ui/screens/ResultsScreen.astro`
- [ ] T010 [P] [US3] Refactor `RevisionScreen` to parse incoming EventBus payloads in `src/ui/screens/RevisionScreen.astro`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: User Story 4 - Deprecation of Legacy Shims (Priority: P2)

**Goal**: Remove backward compatibility code now that the Home Screen routing has been fully modernized.

**Independent Test**: Ensure Speedrun mode still launches without the legacy assignments present.

### Implementation for User Story 4

- [ ] T011 [US4] Remove backward compatibility shim and `window.game` assignments in `src/ui/screens/challenge-screens/SpeedrunScreen.astro`

**Checkpoint**: Technical debt inside the shim is resolved.

---

## Phase 7: User Story 5 - Automated Architectural Enforcement (Priority: P3)

**Goal**: Prevent future regressions by automating validation against `window.game` usage.

**Independent Test**: Intentionally insert a `window.game` assignment into a file and verify the linter rejects the build.

### Implementation for User Story 5

- [ ] T012 [US5] Add `no-restricted-properties` targeting `window.game` directly in the project ESLint configuration file.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T013 Run memory leak validation outlined in `quickstart.md`
- [ ] T014 Execute full testing suite to verify zero regressions across all screen transactions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: N/A
- **User Stories (Phase 3+)**: 
  - Phase 3, 5, 7 can run completely in parallel.
  - Phase 4 must complete before Phase 6 (US4 relies on Home Screen using Event Bus before removing the Home Screen shim).

### User Story Dependencies

- **User Story 1 (P1)**: Independent.
- **User Story 2 (P1)**: Independent.
- **User Story 3 (P2)**: Independent.
- **User Story 4 (P2)**: Depends on User Story 2 (Home Screen must route via EventBus before legacy shims are destroyed).
- **User Story 5 (P3)**: Independent.

### Parallel Opportunities

- All tasks in Phase 3 (`T001` - `T005`) target distinct screen files and can be executed completely in parallel.
- Tasks in Phase 5 (`T009` - `T010`) target distinct screen files and can be executed completely in parallel.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (Migrate the 5 core gameplay screens)
2. **STOP and VALIDATE**: Test each gameplay screen natively.
3. Deploy/demo if ready.

### Incremental Delivery

1. Add User Story 1 → Test independently
2. Add User Story 2 → Test Home Screen Routing independently
3. Add User Story 3 → Test End-Of-Game Flow independently
4. Add User Story 4 → Validate Speedrun Mode clean removal
5. Add User Story 5 → Validate Pipeline failure
6. Run System Polish check
