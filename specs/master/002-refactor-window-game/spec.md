# Feature Specification: Refactoring window.game Global Usage

**Feature Branch**: `002-refactor-window-game`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "Remove window.game global usage and refactor 12 remaining files"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standardized Pattern for Challenge & Practice Screens (Priority: P1)

As a developer, I need the remaining 6 challenge and practice screens to adopt the standardized `EventBus` and `ScreenManager` patterns rather than relying on global `window.game` assignments.

**Why this priority**: These files represent the core gameplay loop; migrating them immediately resolves the bulk of technical debt, eliminates global namespace pollution, and ensures garbage collection can occur properly between screen transitions.

**Independent Test**: Can be fully tested by launching and completing a round in each of the affected modes (Hardcore, Blitz, Exam, Practice, Flashcards) and verifying the state resolves correctly without console errors.

**Acceptance Scenarios**:

1. **Given** the user is on the Home Screen, **When** they launch "Hardcore" mode, **Then** the `HardcoreScreen` controller handles initialization via EventBus without touching `window.game`.
2. **Given** an active gameplay session, **When** the session ends, **Then** the screen controller cleans up all listeners and memory.

---

### User Story 2 - Modernized Home Screen Routing (Priority: P1)

As a developer, I need the Home Screen to trigger mode changes exclusively through the EventBus architecture instead of having 8 different direct method assignments.

**Why this priority**: `HomeScreen.astro` is the primary entry point and worst offender for global coupling. Fixing it unblocks the removal of backward compatibility shims in other files.

**Independent Test**: Can be fully tested by switching between all available game modes from the Setup Panel on the Home Page.

**Acceptance Scenarios**:

1. **Given** the user configures a mode, **When** they click "Initialize Challenge", **Then** the system fires an event (e.g., `game:start`) that the respective screen controller intercepts.

---

### User Story 3 - Clean Results and Revision Flow (Priority: P2)

As a user, I need the end-of-game flows (Results Screen and Revision Encyclopedia) to receive data and initialize robustly via the event-driven system.

**Why this priority**: Closes the loop on the gameplay lifecycle by ensuring post-game states are cleanly decoupled from the actual game engine termination.

**Independent Test**: Ensure completing a game successfully navigates the user to the correct Results screen with the accurate final score.

**Acceptance Scenarios**:

1. **Given** the player finishes a Speedrun, **When** the results screen loads, **Then** it pulls the final stats safely from the Event Payload instead of a global state.

---

### User Story 4 - Deprecation of Legacy Shims (Priority: P2)

As a maintainer, I need the temporary backward compatibility code in `SpeedrunScreen.astro` to be fully purged.

**Why this priority**: Eliminates redundant code and finalizes the transition away from the legacy structure.

**Independent Test**: Static analysis confirms deletion of the code blocks.

---

### User Story 5 - Automated Architectural Enforcement (Priority: P3)

As a maintainer, I need automated tooling to reject any new code attempting to access `window.game`.

**Why this priority**: Prevents future regressions and enforces the architectural standard system-wide.

**Independent Test**: Can be fully tested by temporarily inserting a `window.game` assignment and verifying the CLI linter fails the build.

### Edge Cases

- What happens when a screen is unmounted before an event is fully processed? (It should unsubscribe cleanly from the EventBus without throwing reference errors).
- How does the system handle rapid, repeated clicking of the "Initialize Challenge" button on the Home Screen? (Should not instantiate duplicate game engine instances).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST decouple all Challenge and Practice screens from the global `window.game` object.
- **FR-002**: System MUST transition `HomeScreen.astro`, `ResultsScreen.astro`, and `RevisionScreen.astro` to communicate utilizing the standard event-driven architecture.
- **FR-003**: System MUST remove the legacy backward compatibility shim currently present in `SpeedrunScreen.astro`.
- **FR-004**: System MUST include a static analysis rule (e.g., in `.eslintrc.js` or `.eslintrc.json`) specifically forbidding restricted property access on the `window` object for `game`.
- **FR-005**: System MUST ensure component teardown logic cleanly unregisters any active event listeners.

### Key Entities

- **EventBus**: The centralized messaging pub/sub system facilitating cross-screen communication.
- **ScreenManager**: Responsible for the DOM lifecycle and transitioning active classes between Astro components.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Static analysis confirms exactly zero (0) instances of `window.game` remain globally within the `/src/ui` directory.
- **SC-002**: Automated and manual testing confirms all 7 game modes launch, run, and conclude correctly, exhibiting 0 behavior regressions.
- **SC-003**: The build pipeline's linting step fails completely and explicitly if any test code introduces `.game` on the `window` object.

## Assumptions

- The `BaseScreenController` and `EventBus` infrastructure is already robust enough to support all screen types without requiring fundamental modifications to the core engine.
- Linting is already configured in the project and can be extended with a standard rule for restricted globals or properties without requiring a new library.
