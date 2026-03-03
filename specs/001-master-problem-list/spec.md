# Feature Specification: Master Problem List & Architecture Stabilization

**Feature Branch**: `001-master-problem-list`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "resolve master problem list and architectural disaster"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System Stability & Memory Management (Priority: P1)

As a player, I want to play consecutive game sessions without my browser Tab crashing or slowing down, so that my learning experience is seamless and uninterrupted.

**Why this priority**: Memory leaks (P0 issues 1-5) currently destroy the user experience after a few rounds. This is a production blocker.

**Independent Test**: Can be fully tested by playing 10 consecutive game sessions and monitoring browser memory footprint. Handled by verifying no DOM nodes or EventBus listeners accumulate.

**Acceptance Scenarios**:

1. **Given** the user finishes a game and returns to the home screen, **When** they navigate away, **Then** the Screen Controller's `onDestroy()` method fires, clearing all tracked subscriptions and destroying the GameEngine instance.
2. **Given** the user navigates between subjects, **When** the route changes, **Then** `window.subjectData` is cleared and no old subject data pollutes the global scope.

---

### User Story 2 - Transactional Data Integrity (Priority: P1)

As a user tracking my progress, I want my scores, streaks, and flashcard progress to be saved accurately even if an error occurs mid-save, so that my learning data is never corrupted.

**Why this priority**: Missing transaction safety (P0 issues 6, 7, 9) risks catastrophic data loss.

**Independent Test**: Can be fully tested by simulating a database write failure mid-transaction and verifying that no partial stats are committed.

**Acceptance Scenarios**:

1. **Given** a multi-step database update (e.g., updating Player stats and Question metrics), **When** the second step throws an error, **Then** the `UnitOfWork` rolls back the first step, leaving the database in its original state.
2. **Given** invalid data enters the system from an old cache, **When** it hits the API boundary, **Then** runtime Zod validation rejects it before it reaches the Database Repositories.

---

### User Story 3 - API & Component Decoupling (Priority: P2)

As a developer maintaining the platform, I want a unified API facade and clear component boundaries, so that I don't accidentally cause cascading failures when updating a single UI component.

**Why this priority**: Direct repository access from UI (P0 #10, P1 #15) violates the strict layering architectural principle.

**Independent Test**: Can be fully tested by ensuring zero imports from `infrastructure/db/repositories` exist inside the `src/ui/` directory.

**Acceptance Scenarios**:

1. **Given** a UI component needs player data, **When** it requests the data, **Then** it must call `API.Player.get()` rather than instantiating `PlayerRepository` directly.
2. **Given** a database migration is pending, **When** the app loads, **Then** migration status is cached in memory (P0 #11) preventing redundant query execution on every page load.

---

### Edge Cases

- What happens when a user loses offline storage capacity during a transaction? (Should trigger a `DatabaseError` and safely rollback).
- How does system handle malformed legacy data that fails Zod runtime validation? (Should trigger a `ValidationError` and attempt to migrate or reset the specific corrupted entity gracefully).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a `onDestroy` lifecycle hook on all 8 game screens to clean up subscriptions and engine instances.
- **FR-002**: System MUST orchestrate all database writes affecting multiple entities through a `UnitOfWork` transaction boundary.
- **FR-003**: System MUST provide a unified API Facade that wraps all Repository operations and enforces Zod runtime validations.
- **FR-004**: System MUST clear the Component Registry and `window.subjectData` upon subject change or return to the main menu.
- **FR-005**: System MUST merge the dual `Subject` class implementations into a single, validated entity.
- **FR-006**: System MUST execute and cache Database Migrations exactly once per application lifecycle, preventing redundant executions on page load.
- **FR-007**: System MUST standardize error handling by introducing explicit `DatabaseError` and `ValidationError` types.

### Key Entities

- **UnitOfWork**: Manages SQLite transaction boundaries (`begin`, `commit`, `rollback`) across multiple repositories.
- **API Facade**: The singular gateway restricting UI components from directly instantiating infrastructure classes.
- **BaseScreenController**: The extended UI controller base class enforcing the new `onDestroy` teardown methodology.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 orphaned EventBus subscriptions after 1 hour of simulated continuous gameplay.
- **SC-002**: Memory footprint remains stable (< 5% variance) after 50 consecutive game instantiations and destroys.
- **SC-003**: 100% of multi-entity database mutations execute within a transaction boundary.
- **SC-004**: 0 direct imports of `src/infrastructure/db/repositories/*` exist within the `src/ui/*` directory structure.
- **SC-005**: Application startup time (including DB Migration checks) is reduced to < 500ms.
