# Specification Review: 001-master-problem-list

**Review Date:** 2026-03-03
**Reviewed By:** Jules (Technical PM / Architect)
**Target Documents:** `specs/001-master-problem-list/spec.md`, `specs/001-master-problem-list/checklists/architecture.md`

## Executive Summary

The initial draft of the `001-master-problem-list` specification sets a strong foundation for resolving critical architectural and stability issues, particularly around memory management and data integrity. However, to pass the rigorous quality gates defined in `checklists/architecture.md`, the spec requires several refinements.

The primary gaps involve missing quantitative metrics for non-functional requirements, lack of explicit entity/component definitions, and undefined behaviors for specific edge cases (e.g., migration failures, `onDestroy` errors).

Below is a detailed breakdown of the gaps identified against the architecture checklist, along with actionable suggestions to update the `spec.md`.

---

## 1. Requirement Completeness & Clarity

**Gaps Identified:**
* **CHK001 (Memory Thresholds):** The spec states "< 5% variance" for memory footprint (SC-002) but lacks an absolute boundary.
* **CHK002 (UoW Entities):** FR-002 mentions "multiple entities" but does not exhaustively list which entities require transactional boundaries.
* **CHK003 (Game Screens):** FR-001 mentions "all 8 game screens" without naming them.
* **CHK004 & CHK008 (API Facade & Error Handling):** The exact scope of the API Facade and how Zod errors are handled (user-facing vs. telemetry) is not defined.
* **CHK005 (Performance Metrics):** "Seamless and uninterrupted" (US1) is qualitative, not quantitative.
* **CHK006 & CHK007 (Terminology & Legacy Data):** Terms like "corrupted" and "malformed legacy data" lack concrete examples.

**Architectural Suggestions for `spec.md`:**
1. **Update SC-002:** Define a hard limit for JS heap size (e.g., "Max JS heap size remains under 100MB and shows < 5% baseline variance after 50 game loops").
2. **Update FR-002:** Explicitly list the target entities: *Player Stats, Question Metrics, Flashcard Progress, and Session History*.
3. **Update FR-001:** Enumerate the 8 game screens in an appendix or inline (e.g., Multiple Choice, Fill in Blank, etc.).
4. **Update FR-003 & FR-007:** Specify that the API Facade covers *all* database repositories. Define that `ValidationError`s should be logged via telemetry and present a generic "Data Sync Error" to the user, rather than raw validation strings.
5. **Update US1 Acceptance Scenarios:** Add a metric for "seamless" (e.g., "Main thread GC pause times remain < 16ms to prevent frame drops").
6. **Update Edge Cases:** Define "malformed legacy data" with an example (e.g., "A saved player object missing the `lastReviewed` timestamp field").

---

## 2. Consistency & Measurability

**Gaps Identified:**
* **CHK009 (Lifecycle Consistency):** It is unclear if clearing `window.subjectData` is a separate operation or part of a unified `ComponentRegistry.clear()` lifecycle.
* **CHK011 & CHK012 (CI Measurability):** Automating the measurement of "0 orphaned EventBus subscriptions" and "< 5% memory variance" across different browser engines is tricky without defined methodology.
* **CHK013 (Startup Time):** "Application startup time < 500ms" (SC-005) needs a specific web vital definition.

**Architectural Suggestions for `spec.md`:**
1. **Update FR-004:** Clarify that `ComponentRegistry.clear()` is the singular orchestrator that subsequently clears `window.subjectData` to ensure lifecycle consistency.
2. **Update SC-001 & SC-002:** Specify the testing harness. For example, "Measured via Playwright using Chrome's `performance.memory` API" and "Measured by querying the EventBus internal subscriber map via a global test hook."
3. **Update SC-005:** Redefine as "Time to Interactive (TTI) < 500ms on a simulated Fast 3G / 4x CPU slowdown profile, including DB migration checks."

---

## 3. Scenario & Edge Case Coverage

**Gaps Identified:**
* **CHK014 (Concurrent Writes):** Rapid consecutive game saves are not addressed.
* **CHK016 (Zero-State):** The first-time app load scenario (empty DB) is missing.
* **CHK017 (Migration Failures):** No fallback defined if a DB migration script fails mid-execution.
* **CHK018 (`onDestroy` Exceptions):** If one component throws in `onDestroy`, it might halt the entire teardown sequence.
* **CHK019 (Storage Quotas):** `QuotaExceededError` handling is vague.

**Architectural Suggestions for `spec.md`:**
1. **Add to UoW Requirements (FR-002):** Specify that concurrent UoW transactions must be queued or rejected gracefully (e.g., SQLite `BUSY` timeout handling).
2. **Add Acceptance Scenario to US3:** "Given a fresh installation, When the app loads, Then the database initializes the schema from scratch and completes migrations before rendering the UI."
3. **Add to Edge Cases:**
   - "If a DB migration fails, the application MUST halt and display a 'Database Initialization Failed' fatal error screen; migrations MUST NOT be left in a partial state."
   - "The `BaseScreenController` MUST wrap individual component `onDestroy` calls in a `try/catch` block to guarantee the teardown loop completes even if one component errors."
   - Map `QuotaExceededError` to `DatabaseError` and specify a user-facing "Local Storage Full" prompt.

---

## 4. Non-Functional Requirements & Dependencies

**Gaps Identified:**
* **CHK020 (Validation Latency):** Large datasets could block the main thread during Zod validation.
* **CHK021 (Telemetry):** Rollbacks must be observable.
* **CHK022 (WASM Assumptions):** Relying on SQLite WASM without a fallback or explicit requirement boundary.
* **CHK025 (API Facade Scope):** Does the Facade handle business logic or just I/O validation?

**Architectural Suggestions for `spec.md`:**
1. **Add NFR Section:**
   - **Performance:** "Zod schema validations for standard payloads MUST complete in < 5ms to prevent main thread blocking."
   - **Observability:** "All UnitOfWork rollbacks MUST be logged to the console (and telemetry if configured) with the originating transaction context."
2. **Clarify Dependencies:** State the minimum browser support required for SQLite WASM (e.g., OPFS support). Define the fallback behavior (e.g., "App shows 'Browser Not Supported' if OPFS/WASM is unavailable").
3. **Update FR-003:** Clarify that the API Facade is a *Validation and Orchestration Facade*. It strictly handles Zod validation and UoW orchestration, while business rules (e.g., scoring logic) remain in domain services.
