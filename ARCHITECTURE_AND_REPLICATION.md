# Architecture & Replication Guide: The "Speedrun" Study Engine

## 1. System Philosophy: The "Speedrun" Pattern

**Abstract Function:**
This project is a **Gamified High-Frequency Testing Engine (GHFTE)** representing a Single Page Application (SPA). Its core philosophy is to transform passive study material into an active, high-pressure "speedrun" game. It replaces traditional "read and recall" viewing with "action and reaction" mechanics.

**Core Mechanics:**
1.  **Velocity**: Time pressure is a first-class citizen. Timers are not optional features but core constraints.
2.  **Immediacy**: Instant feedback loops (Correct/Incorrect/Explanation) reinforce neural pathways immediately.
3.  **Quantification**: Every interaction is measured (Streak, Score, Time, Accuracy) to provide dopamine feedback.
4.  **Modularity**: The *Engine* (Logic/UI) is strictly separated from the *Payload* (Questions/Terminology), allowing instant retargeting to new domains.

---

## 2. File-by-File Abstract Analysis

### 2.1. The Shell: `index.html`
**Function:** The Application Shell & Viewport Manager.
**Abstraction:**
*   **Static Skeleton:** Defines the immutable layout including the Header, Mode Selector, Progress Dashboard, and Footer.
*   **Dynamic Viewports:** Contains container `div`s with unique IDs (e.g., `#homeScreen`, `#quizScreen`, `#flashcardScreen`) acting as "Scenes" or "Pages".
*   **State Class Toggling:** Uses a simple CSS class-based system (e.g., `.active`, `.hidden`) to switch views instantly without page reloads.
*   **Asset Linkage:** Hard-links the CSS design system and the JS module entry point.
*   **Agent Replication Instruction:** Maintain the ID structure exactly. Rename the `<title>` and `<h1>` elements to match the new subject domain.

### 2.2. The Visual Cortex: `css/styles.css`
**Function:** The Experiential Design System.
**Abstraction:**
*   **Variable-Based Theming:** Uses CSS Variables (`:root`) for all colors, allowing instant "reskinning" (e.g., changing `--accent` from Cyan to Green changes the entire app vibe).
*   **Glassmorphism Engine:** Defines utility classes for translucent, blurred backgrounds (`backdrop-filter`) to create a modern, premium feel.
*   **Animation Library:** keyframes for gamification feedback (shaking on error, glowing on success, confetti particles).
*   **Responsive Grid:** Media-query driven layouts that adapt cards from grid to stack on mobile.

### 2.3. The Engine: `js/app.js`
**Function:** The State Machine & Logic Controller.
**Abstraction:**
*   **State Management:** Holds volatile variables: `currentScore`, `timer`, `currentStreak`, `userAnswers`.
*   **Router Logic:** Listens for UI events (clicks) to hide all Viewports and unhide the target Viewport.
*   **Gamification Logic:**
    *   *Streak System:* Increments counter on consecutive corrects, resets to 0 on error. Triggers visual effects at milestones.
    *   *Timer System:* Decrements per second. Changes visual state (color) as time runs low.
*   **Component Rendering:**
    *   *Question Factory:* Accepts a raw Data Object (from `questions.js`) and generates HTML markup based on its `type` property (MCQ, Multi-select, True/False).
    *   *Feedback Loop:* Intercepts user submission, compares against `correct` index/value, updates State, renders Explanation immediately.
*   **Persistence:** Uses `localStorage` to save high scores and run history between sessions.

### 2.4. The Question Bank (Payload A): `js/questions.js`
**Function:** The Assessment Schema.
**Abstraction:**
*   **Data Structure:** Exports an Array of Objects.
*   **Schema Definition:**
    *   `id` (Integer): Unique identifier.
    *   `category` (String): Grouping tag for "Practice Mode" filtering.
    *   `type` (Enum): `mcq` (1 answer), `multi` (n answers), `tf` (boolean).
    *   `question` (String): The prompt.
    *   `options` (Array<String>): The possible choices.
    *   `correct` (Integer | Array<Integer> | Boolean): The solution key.
    *   `explanation` (String): Contextual feedback text shown *after* answering.
    *   `relatedTerms` (Array<String>): Foreign keys linking to `terminology.js`.
*   **Agent Replication Instruction:** This is the primary injection point. Replace this array entirely with new subject matter questions while strictly adhering to the schema.

### 2.5. The Knowledge Base (Payload B): `js/terminology.js`
**Function:** The Encyclopedia & Context Engine.
**Abstraction:**
*   **Data Structure:** Exports a Dictionary/Map Object.
*   **Key-Value Pair:** `Key` = The specific term (e.g., "Mitochondria"), `Value` = Detail Object.
*   **Schema Definition:**
    *   `Category` (String): Filtering tag.
    *   `Meaning` (String): Formal definition.
    *   `Analogy` (String): "Like a..." simplified comparison (critical for the 'Mastery' learning model).
    *   `Pros`/`Cons` (Array<String>): Comparative analysis (if applicable).
*   **Agent Replication Instruction:** Replace this object with the definitions relevant to the new subject. Keys here must match `relatedTerms` in the Question Bank to enable the "Contextual Definition" feature.

### 2.6. The Tuner: `js/config.js`
**Function:** The Balance Sheet.
**Abstraction:**
*   **Constants:** Exports immutable values that control difficulty and pacing.
*   **Parameters:**
    *   `PASSING_SCORE`: Threshold percentage.
    *   `TIMERS`: Seconds allowed per mode.
    *   `STREAK_MILESTONES`: Dictionary of `{ count: "Message" }` for gamification.
*   **Agent Replication Instruction:** Adjust `TIMERS` based on the density/difficulty of the new subject matter (e.g., Math might need more time per question than Vocabulary).

---

## 3. Integration & Data Flow Architecture

### 3.1. The "Start Run" Flow
1.  **Trigger:** User clicks "Start Speedrun".
2.  **app.js:**
    *   Imports `questionBank` from `questions.js`.
    *   Shuffles the array (Fisher-Yates algorithm).
    *   Resets State (Score=0, Timer=Max).
    *   Hides `homeScreen`, Shows `quizScreen`.
    *   Calls `renderQuestion(0)`.

### 3.2. The "Contextual Loop" Flow (The 'Detailed' Feature)
1.  **Render:** `app.js` renders a question.
2.  **Check:** It checks if the question object has a `relatedTerms` array.
3.  **UI Generation:** If yes, it dynamically renders a "Show Definitions" button.
4.  **Interaction:** User clicks button.
5.  **Lookup:** `app.js` queries `terminology.js` using the strings in `relatedTerms` as keys.
6.  **Display:** A modal overlay shows the extracted `Meaning` and `Analogy` for those specific terms, creating a "Just-in-Time" learning moment without leaving the assessment flow.

### 3.3. The "Flashcard" Flow (SRS Abstraction)
1.  **Init:** User starts Flashcard mode.
2.  **Selection:** `app.js` grabs keys from `terminology.js`.
3.  **Shuffle:** Randomizes the order.
4.  **Display:** Renders the Key (Term) on the front `div`.
5.  **Interaction:** User clicks -> CSS 3D Transform `rotateY` flips the card.
6.  **Reveal:** Renders the Value (`Meaning`) on the back `div`.

---

## 4. Replication Protocol for Agents

**To replicate this system for `[NEW_SUBJECT]`, follow these steps strictly:**

1.  **Cloning:** Copy the entire codebase structure (`index.html`, `css/`, `js/`).
2.  **Payload Replacement (Data Layer):**
    *   **Step 1:** Erase `js/questions.js` content. Generate 50-100 questions on `[NEW_SUBJECT]` using the provided data schema.
    *   **Step 2:** Erase `js/terminology.js` content. Generate a glossary of key terms for `[NEW_SUBJECT]` using the provided schema.
3.  **Configuration (Tuning Layer):**
    *   **Step 3:** Edit `index.html`. Change `<title>` and `<h1>` to `[NEW_SUBJECT] Mastery`.
    *   **Step 4:** Edit `js/config.js` if the subject requires different timing (e.g., increase time for complex problem solving).
4.  **Theming (Visual Layer):**
    *   **Step 5:** Open `css/styles.css`. Update the `:root` variables (`--primary`, `--accent`) to a color palette that fits the `[NEW_SUBJECT]` (e.g., Green for Biology, Blue for Physics, Red for History).
5.  **No Logic Changes Needed:** Do **NOT** touch `js/app.js` unless you are adding a completely new gameplay mechanic. The engine is agnostic.
