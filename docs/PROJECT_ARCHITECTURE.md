# Mastery Protocol V2 - Architecture Documentation

## 1. Overview
Mastery Protocol V2 is an Astro-based educational web application designed for high-performance revision and quizzing. It employs an **Event-Driven, Component-Composition Architecture** coupled with an **Offline-First SQLite WASM Database**, enforcing strict layered boundaries to ensure scalability, data integrity, and a premium user experience.

## 2. Core Architecture Levels

### 2.1 The Data Access Layer (Repositories & UnitOfWork)
To guarantee consistency during offline execution, all database interactions are mediated through strict boundaries:
- **`DatabaseService`**: The SQLite singleton initializing either an OPFS persistence layer or in-memory fallback.
- **Repositories**: Focused classes (`PlayerRepository`, `GameHistoryRepository`, `SubjectRepository`) responsible *only* for raw CRUD operations.
- **`UnitOfWork` & `TransactionManager`**: Wrappers that provide explicit `BEGIN`, `COMMIT`, and `ROLLBACK` safety. No multi-table operation occurs without a Unit of Work transaction (e.g., `saveGameSession`) to prevent partial state corruption.

### 2.2 The Logic Layer (API Facades)
UI components are strictly forbidden from instantiating Repositories directly. Everything routes through API Facades:
- **`GameApi` / `PlayerApi` / `AchievementApi`**: Singletons providing standard business logic and data masking.
- **Validation**: Facades utilize `zod` schemas to strictly parse and validate raw inputs before touching the core repositories.
- **Orchestration**: They abstract `UnitOfWork` workflows so UI controllers only perform singular asynchronous calls.

### 2.3 The UI Layer (State & Lifecycle)
The UI consists of granular Astro components communicating independently, heavily preventing memory leaks via structured lifecycles:
- **`ComponentRegistry` & `ScreenManager`**: Manages the construction, registration, and strict garbage collection of components when users navigate between screens.
- **`SubjectState`**: Safely scopes global subject data (`subjectState.setSubject()`), replacing previous dirty `window.subjectData` patterns.
- **Lifecycle Interfaces**: `BaseScreenController` demands `onDestroy()` implementation, guaranteeing automatic unbinding of DOM events and EventBus topic subscriptions.

## 3. Global Event Bus Orchestration
Components do not tightly couple or directly invoke each other's visual updates. They communicate purely through `EventBus`:
- `ComponentRegistry` automatically scrubs and unsubscribes events on screen teardown to prevent orphaned subscriber leaks.
- Typical events include `game:stats-update`, `game:time-update`, `request-hint`, and `game:progress-update`.

## 4. Directory Structure
```text
src/
├── infrastructure/     # Low-level systems
│   ├── db/             # SQLite WASM, Repositories, UnitOfWork
│   └── events/         # EventBus Implementation
├── logic/              # Business Rules
│   ├── api/            # Zod-validated API Facades
│   ├── entities/       # Domain Models (Subject)
│   └── state/          # SubjectStore, UIStore
├── ui/                 # View Layer
│   ├── screens/        # Game Modes & Menus / Screens
│   ├── components/     # ActionButtons, MCQCard, Status Displays
│   └── registry/       # ComponentRegistry, ScreenManager
```

## 5. Standard Development Principles
- **No Direct Repo Access**: UI controllers must import `gameApi` instead of `GameHistoryRepository`.
- **Database-First Resilience**: Critical user flows treat the local OPFS database as the source of truth; API synchronization executes asynchronously and resolves silently in the background.
- **Strict Cleanups**: Any DOM event listener or `EventBus.subscribe()` MUST be tracked via `this.addEventListener` or detached directly in `onDestroy()`.
