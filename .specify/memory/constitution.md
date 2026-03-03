<!--
SYNC IMPACT REPORT
- Version change: 1.0.0 → 1.1.0
- Modified principles: N/A
- Added sections:
  - Added Rule 5 to Coding Operations & Governance regarding Jules CLI sessions.
- Removed sections: N/A
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
- Follow-up TODOs: None.
-->

# Mold V2 Constitution

## Core Principles

### I. Offline-First Architecture
Handsets must primarily function without network access. Data is cached locally (IndexedDB/SQLite) and the application reads from this local cache for all gameplay. Network usage is restricted to a dedicated "Synchronization" or "Asset Loading" phase upon subject entry.

### II. Database-First Strategy
The local SQLite database is the Single Source of Truth for the application runtime.

### III. Strict Layering
The codebase MUST enforce strict separation of concerns into distinct layers:
- UI Layer: (Astro Components) exclusively handles presentation and user interaction.
- Logic Layer: (Entities like `Subject`, `Player`) contains business logic but delegates persistence.
- Infrastructure Layer: (Repositories, DatabaseService) handles raw data access and storage.

### IV. Repository Pattern & Dependency Inversion (DIP)
Encapsulate data access logic (`SubjectRepository`, `PlayerRepository`), decoupling the business entities from the specific database implementation (SQLite WASM). Entities MUST depend on abstractions (Repositories/Services) rather than concrete lower-level details (Raw SQL).

### V. Component Composition & Event Orchestration
Game screens (`Speedrun`, `Practice`) MUST be composed of smaller, reusable components (`GameHeader`, `QuestionContainer`, `GameFooter`) rather than monolithic files. Components communicate primarily through `window` custom events (e.g., `game:stats-update`, `request-submit`), avoiding monolithic monolithic controllers that map the entire UI state.

## UX & UI Choices

1. **Seamless Offline Experience**: Users are unaware of the data source shift. The "Loading Assets" overlay manages expectations during the sync phase.
2. **Centered Focus**: The "Question Frame" is centered with an invisible patterned background to focus user attention.
3. **Reachable Interaction**: Footers and controls are designed to be reachable (scrolling/fixed positioning) to ensure usability.
4. **Instant Feedback**: Game logic provides immediate feedback (correct/incorrect) on interaction.
5. **Aesthetic Polish**: Adhere to modern, "Premium" aesthetics including Glassmorphism, rich colors, and dynamic animations.

## Coding Operations & Governance

1. **Encapsulation**: Database operations are strictly separated from Logic (Entity) files.
2. **Evolutionary Database Design**: Database migrations check for existing schemas and evolve them rather than wiping/resetting, preserving user data.
3. **Strong Typing**: Apply strict TypeScript interfaces for properties, data structures, and use Zod schemas for AI/API contracts.
4. **Defensive Coding**: Implement fallbacks for API fetching (case-insensitivity checks, retry logic) and Asset Loading (checks for missing data).
5. **Jules CLI Autonomy**: Lead developers and orchestrating agents MUST retain full control and discretion over firing new collaborative `jules` CLI sessions when partitioning parallelizable work.

**Version**: 1.1.0 | **Ratified**: 2026-03-03 | **Last Amended**: 2026-03-03
