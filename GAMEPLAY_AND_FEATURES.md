# MOLD V2: Gameplay, Home Page, and Achievements

This document provides a comprehensive overview of the MOLD V2 application structure, focusing on the user's primary interface (the Home Page), the diverse Gameplay Modes, and the Achievement system that drives engagement.

---

## 1. The Home Page (The Command Center)
The Home Page acts as the central hub for any given subject. It is designed around the "MASTERY PROTOCOL V2" aesthetic and provides immediate access to gameplay configuration and historical performance.

### Key Components:
- **Hero Header:** Displays the currently loaded Subject Name (e.g., "Theory of Computation") and its overarching description.
- **Setup Panel:** Allows users to tweak pre-game configurations, such as toggling time limits, adjusting difficulty, or enabling specific modifiers (e.g., Survival modifiers).
- **Mode Selector:** A central UI component where users pick their "Operational Mode" (detailed below).
- **Target Sector (Category Grid):** A dynamic UI element that **only appears when "Practice" mode is selected**. It renders all topics within the subject and displays the exact number of questions available in each, allowing targeted learning.
- **Action Hub:** Provides the primary controls:
  - **Encyclopedia (Ref):** Direct access to the subject's Terminology and full question database for unpressured reading.
  - **Initialize Challenge:** Launches the Game Engine with the configured settings and selected mode.

### Performance Tracking (Operation Logs):
The bottom half of the Home Page is dedicated to historical data and metrics:
- **Aggregate Stats:** Displays Total Runs, Cumulative Best Score (Accuracy %), Best Streak, and Average Score.
- **Recent Runs Table:** A ledger of the last 10 attempts, showing the Date, Mode played, Score, Time Taken, and an assigned **Letter Grade**.
  - *Grading Scale:* S+ (≥97%), S (≥93%), A+ (≥90%), A (≥87%), B+ (≥80%), C+ (≥70%), D+ (≥60%), F (<60%).
- **Trophy Counter:** Displays the overarching completion of Subject Achievements (e.g., `🏆 4/12`).

---

## 2. Gameplay Modes
MOLD V2 supports a highly configurable `GameEngine` that adapts to different testing strategies via the `ModeRegistry`. 

### The Core Challenge Modes
1. **Speedrun (Time Attack)** ⚡
   - *Objective:* Complete all questions in the subject under a strict global time limit.
   - *Mechanics:* Includes a high-pressure UI with a global countdown timer. Certain configurations activate a "Stress Bar", forcing users to answer individual questions within seconds or forfeit them.
2. **Blitz** 🎯
   - *Objective:* Quick, intense review sessions.
   - *Mechanics:* Instead of the entire subject, the engine pulls a randomized, smaller subset of questions. Designed for daily rapid reinforcement.
3. **Hardcore** 🔥
   - *Objective:* Deep analysis and application without room for error.
   - *Mechanics:* Exclusively filters for questions tagged with `Difficulty: Hard`. If there are fewer than 5 hard questions, the engine shuffles the entire pool. Accuracy represents true mastery. Includes a modular Hint System.
4. **Survival** ☠️
   - *Objective:* Outlast the timer.
   - *Mechanics:* A progressive difficulty mode where the time limit constantly decreases as the player progresses, forcing increasingly rapid cognitive recall.

### The Learning Modes
5. **Practice** 📚
   - *Objective:* Relaxed, targeted learning.
   - *Mechanics:* Completely untimed and pressure-free. The user selects a specific Category (e.g., "Turing Machines") from the Home Page grid and practices only those questions to drill weak points.
6. **Flashcards / Terminology** 🃏
   - *Objective:* Rote memorization of key terms and high-impact Q&A.
   - *Mechanics:* Bypasses the standard multiple-choice UI in favor of a spatial repetition or simple flip-card interface, focusing purely on recall.
7. **Full Revision (Exam)** 🎓
   - *Objective:* 100% Mastery demonstration.
   - *Mechanics:* The ultimate test. Forces strict sequential order, combining standard questions with terminology checks in a simulated examination environment.

---

## 3. The Achievement System
Achievements in MOLD V2 serve as long-term retention hooks to motivate players to explore all aspects of a subject.

### Architecture & Persistence
- **Storage:** Persisted locally using SQLite WASM + OPFS via the [AchievementRepository](file:///d:/Study/Programming/Projects/Finals/src/infrastructure/db/repositories/AchievementRepository.ts#22-173).
- **Definitions:** Base achievements for each subject are defined in `achievements.json` alongside the subject data schemas. Each definition includes an `id`, `title`, `description`, `icon`, and the programmatic `condition` required to unlock it.

### Mechanics & Progression
- **Evaluation:** As the player completes games, the `GameEngine` and EventBus emit stats (e.g., `accuracy`, `streak`, `timeTaken`, `mode`). The system evaluates these against the JSON-defined conditions (for example: *Complete a Speedrun with >90% accuracy* or *Maintain a 15-question streak*).
- **Unlocking:** When a condition is met, a `player_achievements` record is created, permanently timestamping the unlock.
- **Visibility:** Progress is continuously updated and displayed on the Home Page as a cumulative fraction. Fully unlocked achievements integrate directly into player profiles to quantify subject mastery.
