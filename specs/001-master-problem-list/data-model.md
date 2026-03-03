# Data Model: Architecture Refactor

Since this feature primarily addresses technical debt and architectural leaks, the "models" are structural patterns rather than traditional database entities.

## 1. UnitOfWork (Transaction Management)
*   **Purpose**: To ensure atomicity in database operations (Issue #6, #9).
*   **Methods**:
    *   `begin()`: Starts a transaction block.
    *   `commit()`: Commits all operations.
    *   `rollback()`: Reverts operations on failure.
*   **Usage**: All multi-repo operations (e.g., answering a question which updates Player stats and Question stats) must be wrapped.

## 2. API Facade (Layer Boundary)
*   **Purpose**: Serves as the stringent boundary between the UI Components and the Repositories/Logic layer (Issue #10, #15).
*   **Role**: Validate incoming data via Zod, manage the UnitOfWork, and construct Response objects.

## 3. Scoped State Store
*   **Purpose**: Replaces the problematic global `window.subjectData` (Issue #3) and `window.game` (Issue #13).
*   **Behavior**: A singleton or context-bound object that correctly instantiates and destroys itself upon navigating to/from a subject route.

## 4. Lifecycle-Aware Screen Controller
*   **Purpose**: A base controller that tracks event listeners and DOM elements (Issue #1, #2, #5).
*   **Methods**:
    *   `init()`: Setup DOM and subscriptions.
    *   `onDestroy()`: Automatically called by the `ScreenManager` when routing away. It clears all tracked EventBus subscriptions and nullifies references.
