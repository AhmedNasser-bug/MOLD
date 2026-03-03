# Review of `spec.md` against `architecture.md` Checklist

**Date:** 2026-03-03
**Reviewer:** Jules, Technical Product Manager & Architect
**Target File:** `specs/001-master-problem-list/spec.md`
**Checklist:** `specs/001-master-problem-list/checklists/architecture.md`

## Executive Summary

The current `spec.md` provides a solid foundational understanding of the core architectural issues (memory leaks, transactional data integrity, and API decoupling). However, when evaluated against the meticulous `architecture.md` checklist, several significant gaps, ambiguities, and unmeasurable criteria emerge.

To clear the architecture checklist, the specification requires increased precision regarding performance metrics, edge-case handling (especially around exceptions and zero-states), and explicit boundaries for the proposed architectural components.

---

## Detailed Findings & Recommendations

### 1. Requirement Completeness (CHK001 - CHK004)

**Findings:**
*   **CHK001 (Memory Boundaries):** The spec states "memory footprint remains stable" but lacks explicit thresholds for a "memory leak" (e.g., max heap size, node count limit) before the browser crashes.
*   **CHK002 (Transactional Entities):** The spec mentions "multi-entity database mutations" and gives an example ("Player stats and Question metrics") but fails to provide an exhaustive list of all entities that require the `UnitOfWork` boundary.
*   **CHK003 (8 Game Screens):** FR-001 references "all 8 game screens" but does not explicitly name them. This leaves ambiguity for implementers and testers.
*   **CHK004 (Zod Error Handling):** FR-003 requires Zod runtime validations but doesn't specify what happens when validation fails (e.g., user-facing error message, silent telemetry log, hard crash).

**Suggestions to Improve `spec.md`:**
*   **Update US1 / SC-002:** Define a hard threshold for memory leaks. Example: "Heap size must not exceed 250MB after 50 sessions, and detached DOM nodes must remain at 0."
*   **Update FR-002:** Add an explicit list of the expected transactional groups. Example: "(1) Player Stats + Question Metrics, (2) Flashcard Progress + Spaced Repetition Timers."
*   **Update FR-001:** Explicitly list the 8 screens. Example: "(`MainMenu`, `SubjectSelect`, `QuizScreen`, `FlashcardScreen`, `ResultsScreen`, `StatsScreen`, `SettingsScreen`, `ProfileScreen`)."
*   **Update FR-007 / Edge Cases:** Explicitly define the Zod validation failure behavior. Example: "Zod validation failures MUST trigger a `ValidationError`, log to telemetry, and present a generic 'Data Sync Error' to the user without crashing the app."

### 2. Requirement Clarity (CHK005 - CHK008)

**Findings:**
*   **CHK005 ("Seamless"):** "Seamless and uninterrupted" is a subjective term and lacks measurable performance metrics.
*   **CHK006 ("Corrupted"):** The term "corrupted" regarding partial data saves is too vague.
*   **CHK007 (Malformed Data):** The edge case for malformed data lacks concrete examples.
*   **CHK008 (API Facade Scope):** The scope of the "unified API Facade" (FR-003) is unclear. Does it cover *all* repositories or just a subset?

**Suggestions to Improve `spec.md`:**
*   **Update US1:** Quantify "seamless." Example: "Maintain consistent 60 FPS and GC pause times under 50ms."
*   **Update US2:** Define "corrupted." Example: "An atomic write where part A succeeds and part B fails, leaving the database in an inconsistent relational state (e.g., a streak incremented without the corresponding game log)."
*   **Update Edge Cases:** Add an example for malformed data. Example: "(e.g., a string ID where an integer is expected, or a missing required field)."
*   **Update FR-003:** Explicitly bound the API Facade. Example: "The API Facade MUST wrap all operations for `PlayerRepository`, `QuestionRepository`, and `SubjectRepository`. Direct UI access to any `src/infrastructure/db/repositories/*` is strictly prohibited."

### 3. Requirement Consistency (CHK009 - CHK010)

**Findings:**
*   **CHK009 (window.subjectData):** The spec mentions clearing `window.subjectData` (FR-004), but it's unclear if this aligns perfectly with the lifecycle of the `ComponentRegistry`.
*   **CHK010 (Offline Storage):** The edge case about losing offline storage capacity needs to be consistently aligned with the `UnitOfWork` rollback mechanism in US2.

**Suggestions to Improve `spec.md`:**
*   **Update FR-004:** Clarify the coupling. Example: "The lifecycle of `window.subjectData` MUST strictly mirror the `ComponentRegistry`. Both must be initialized simultaneously and destroyed simultaneously via the `BaseScreenController.onDestroy()` hook."
*   **Update Edge Cases:** Ensure consistency. Example: "Loss of offline storage capacity (QuotaExceededError) MUST trigger the standard `UnitOfWork` rollback protocol, treating it identical to an internal SQL constraint violation."

### 4. Acceptance Criteria Quality (CHK011 - CHK013)

**Findings:**
*   **CHK011 (EventBus Subscriptions):** "0 orphaned EventBus subscriptions after 1 hour" is difficult to automate in standard CI without specialized long-running integration tests.
*   **CHK012 (Memory Variance):** "< 5% variance" memory footprint is hard to measure consistently across different browser JS engines (V8 vs JavaScriptCore).
*   **CHK013 (Startup Time):** "Application startup time < 500ms" lacks a defined measurement methodology (e.g., TTI, LCP).

**Suggestions to Improve `spec.md`:**
*   **Refine SC-001:** Make it more deterministic. Example: "0 orphaned EventBus subscriptions after 50 programmatic mount/unmount cycles of the `GameScreen` component."
*   **Refine SC-002:** Change to a deterministic metric. Example: "0 detached DOM nodes and 0 retained `GameEngine` instances after 50 mount/unmount cycles."
*   **Refine SC-005:** Specify the metric. Example: "Time to Interactive (TTI) must be < 500ms, measured from `DOMContentLoaded` to the first render of the Main Menu, inclusive of the DB Migration check."

### 5. Scenario Coverage (CHK014 - CHK016)

**Findings:**
*   **CHK014 (Concurrent Writes):** The spec does not address race conditions or concurrent database write scenarios (e.g., a user mashing the 'Save' button).
*   **CHK015 (Background Sync):** Fails to address how local `UnitOfWork` transactions interact with background sync failures.
*   **CHK016 (Zero-State):** Does not define the behavior for a first-time app load before any migrations have run.

**Suggestions to Improve `spec.md`:**
*   **Add a new Edge Case/Requirement:** Address concurrency. Example: "The `UnitOfWork` MUST implement a queuing or locking mechanism to handle concurrent write requests to prevent database locks (SQLITE_BUSY)."
*   **Add a new Edge Case:** Address sync. Example: "If a local transaction succeeds but background sync fails, the data must remain in the local database marked with a `syncPending=true` flag."
*   **Update FR-006:** Define zero-state. Example: "On first-time load (empty database), the system MUST execute the initial schema migration seamlessly without presenting a 'migration pending' UI state."

### 6. Edge Case Coverage (CHK017 - CHK019)

**Findings:**
*   **CHK017 (Migration Failure):** What happens if a database migration script fails mid-execution?
*   **CHK018 (onDestroy Failure):** What happens if `onDestroy` itself throws an exception during teardown?
*   **CHK019 (QuotaExceededError):** Mentioned in consistency, but needs explicit mapping to `DatabaseError`.

**Suggestions to Improve `spec.md`:**
*   **Add a new Edge Case:** Handle migration failures. Example: "If a database migration fails mid-execution, the system MUST halt app initialization and present a fatal error screen prompting the user to clear application data."
*   **Add a new Edge Case:** Handle teardown failures. Example: "If `onDestroy` throws an error, the `BaseScreenController` MUST catch the error, log it, and forcefully proceed with destroying the `GameEngine` and clearing subscriptions to prevent a hard lock."

### 7. Non-Functional Requirements (CHK020 - CHK021)

**Findings:**
*   **CHK020 (Zod Performance):** Zod validations on large datasets can cause UI stutter, but no latency budgets are defined.
*   **CHK021 (Telemetry):** No explicit requirement to log `UnitOfWork` rollbacks for observability.

**Suggestions to Improve `spec.md`:**
*   **Add NFR:** Specify validation budgets. Example: "Zod runtime validations MUST execute in < 10ms for standard payloads to prevent main-thread blocking."
*   **Add NFR:** Specify observability. Example: "All `UnitOfWork` rollbacks and explicit `DatabaseError`/`ValidationError` instances MUST be logged to the console (and telemetry if available) with the full error stack and associated transaction payload."

### 8. Dependencies & Assumptions (CHK022 - CHK023)

**Findings:**
*   **CHK022 (SQLite WASM):** Assumes `@sqlite.org/sqlite-wasm` is always available and initializes successfully.
*   **CHK023 (Browser Compat):** Does not explicitly state browser compatibility baselines for the required features (e.g., OPFS for SQLite).

**Suggestions to Improve `spec.md`:**
*   **Add Dependency/Assumption:** Define fallback. Example: "If SQLite WASM fails to initialize (e.g., OPFS not supported), the application MUST present an 'Unsupported Browser' error rather than failing silently."
*   **Add Browser Baseline:** Example: "Target browser baseline: Chrome 109+, Safari 16.4+, Firefox 111+ (versions supporting necessary OPFS/WASM features)."

### 9. Ambiguities & Conflicts (CHK024 - CHK025)

**Findings:**
*   **CHK024 (Dual Subject Merging):** FR-005 mandates merging "dual Subject class implementations" but does not address potential conflicts with offline-first sync strategies if those dual classes were used for local vs. remote state.
*   **CHK025 (API Facade Authorization):** It's ambiguous if the API Facade (FR-003) is solely for schema validation or if it also handles business logic / state authorization.

**Suggestions to Improve `spec.md`:**
*   **Update FR-005:** Clarify the merge strategy. Example: "The merged `Subject` entity MUST support an optional `syncStatus` field to maintain compatibility with future offline-first sync requirements."
*   **Update FR-003:** Clarify the Facade's responsibility. Example: "The API Facade is strictly responsible for routing requests and Zod schema validation; it MUST NOT contain complex business logic or authorization checks, which remain the domain of the core domain services."