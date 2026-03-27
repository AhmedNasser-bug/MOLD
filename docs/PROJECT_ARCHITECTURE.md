# Mastery Protocol V2 - Architecture Documentation

## 1. Overview
Mastery Protocol V2 is an Astro-based educational web application designed for high-performance revision and quizzing. It employs a **Component-Based, Event-Driven Architecture** to ensure modularity, scalability, and a premium user experience.

## 2. Core Architecture
The system moved from a class-based inheritance model (`BaseGameController`) to a **Composition & Event Orchestration** model.

### 2.1 The "Orchestrator" Pattern
Instead of a monolithic controller managing the entire game state and UI:
- **`GameUtils.ts`**: The Source of Truth. Manages persistent state (Score, Timer, Streak) and dispatches global events.
- **`QuestionDisplay.astro`**: The Local Orchestrator. 
    - Fetches Question Data.
    - locating and communicating with `GameHeader` (for score/progress visual) and `GameFooter` (for hints/submission).
    - Manages the specific `QuestionCard` (MCQ, True/False, etc.).

### 2.2 Global Event Bus
Components communicate primarily through `window` custom events:
- `game:stats-update`: Payload `{ correct, incorrect, streak, score }`. Listeners: `ScoreDisplay`, `GameHeader`.
- `game:time-update`: Payload `{ seconds }`. Listeners: `Timer`, `GameHeader`.
- `game:progress-update`: Payload `{ current, total }`. Listeners: `ProgressBar`.
- `request-submit`: Dispatched by `GameFooter`. Handled by `QuestionDisplay`.
- `request-hint`: Dispatched by `GameFooter`. Handled by `HintPopup` or logic.

## 3. Directory Structure

```text
src/
├── data/               # Static JSON Data (Subjects, Questions)
├── layouts/            # Base Astro Layouts
├── styles/             # Global & Component CSS
└── ui/
    ├── components/     # Reusable UI Blocks
    │   ├── GameHeader.astro      # Timer, Progress, Score wrapper
    │   ├── GameFooter.astro      # Controls (Submit, Next, Hint)
    │   ├── QuestionDisplay.astro # Main Question Logic & Rendering
    │   ├── MCQCard.astro         # Multiple Choice Logic
    │   ├── TFCard.astro          # True/False Logic
    │   └── ...
    ├── screens/        # Full-Page Views (Game Modes)
    │   ├── HomeScreen.astro      # Main Menu & Mode Selection
    │   ├── StandardGameScreen.astro # Standard Quiz Mode
    │   ├── SpeedrunScreen.astro  # Speed Mode
    │   └── ...
    └── scripts/        # Shared Typescript Logic
        └── GameUtils.ts          # Central State Manager
```

## 4. Game Modes
Each mode is a self-contained `Screen` component that initializes the game state and handles mode-specific rules (e.g., Time Limits, Per-Life logic).

- **Standard**: Regular quiz flow.
- **Speedrun**: Time-attack mode.
- **Blitz**: High-speed rapid fire.
- **Survival**: "Lives" system + Time pressure.

## 5. Key Tech Stack
- **Framework**: Astro (SSG + Client Hydration)
- **Styling**: Vanilla CSS (Neo-Brutalist Aesthetic)
- **Logic**: TypeScript
- **State**: Custom Event Bus + `GameUtils` Singleton

## 6. How it Works (Flow)
1. **User Starts Game**: `HomeScreen` -> Calls `game.startStats()` -> Switches active Screen.
2. **Screen Init**: `StandardGameScreen` initializes `GameUtils.startGame()`.
3. **Question Load**: Screen calls `QuestionDisplay.render(question)`.
4. **Interaction**: 
   - User selects option in `MCQCard`.
   - `MCQCard` updates visual state.
5. **Submission**:
   - User clicks "Submit" in `GameFooter`.
   - `GameFooter` dispatches `request-submit`.
   - `QuestionDisplay` catches event -> calls `card.reveal()` -> validates.
   - `QuestionDisplay` calls `GameUtils.recordAnswer(isCorrect)`.
6. **Update**:
   - `GameUtils` dispatches `game:stats-update`.
   - `GameHeader` (and `ScoreDisplay`) catch event -> Update DOM.

## 7. Customization
- **Adding Questions**: Edit `src/data/subjects/.../questions.json`.
- **New Modes**: Create `NewModeScreen.astro`, add to `index.astro`, and register in `SUBJECT_MODES`.
