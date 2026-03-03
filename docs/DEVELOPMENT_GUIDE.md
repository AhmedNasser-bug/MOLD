# Development Guide: Mold Application

This document outlines how to maintain and extend the Mold application architecture.

## 🎨 Mold UI (General Layout)

The UI is structured using **Astro Components** with logic encapsulated in `<script>` tags.

- **Root Layout**: [Layout.astro](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/layouts/Layout.astro)  
  Contains the HTML `<head>`, global metadata, background particles, and the main `<slot />`.
- **Main Container**: [Mold.astro](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/components/Mold.astro)  
  The skeletal structure that mounts all screens. It passes the `subjectData` to the client-side `window` object.
- **Atomic Components**: `src/components/ui/`  
  Small, reusable UI units like [Flashcard.astro](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/components/ui/Flashcard.astro) or [TermCard.astro](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/components/ui/TermCard.astro).

---

## 🎮 Quiz Modes

Quiz logic is decentralized into specific screen components.

- **Mode Logic**: [QuizScreen.astro](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/components/screens/QuizScreen.astro)  
  Edit the `startQuiz()` method in the `<script>` tag to change how questions are filtered or shuffled for 'Speedrun', 'Blitz', etc.
- **Mode Selection UI**: [HomeScreen.astro](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/components/screens/HomeScreen.astro)  
  Update the `.mode-selector` div and the `selectMode` method to add new difficulty levels or modes.

---

## 🚥 Routing & Navigation

Navigation is handled via a **pseudo-router** using `showScreen(id)` and global method registration.

- **Screen Switching**: Each screen component has a `showScreen(id)` method that toggles the `.active` class on `.screen` elements.
- **Global API**: Screens register their methods (like `startQuiz`, `goHome`) to `window.game` in their respective `bindEvents()` methods. This allows cross-component interaction (e.g., clicking a button on Home triggers logic in Quiz).

---

## 🤖 AI Pipeline & Prompts

The AI generation pipeline follow a **Chain of Responsibility** and **Adapter** pattern.

- **Pipeline Orchestration**: [GenerationPipeline.ts](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/processing/GenerationPipeline.ts)  
  This is where the high-level execution flow is defined.
- **Adapters (Prompts)**: Implementations in `src/ai/` (e.g., [OpenAIAdapter.ts](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/ai/OpenAIAdapter.ts))  
  To update system prompts or model parameters, modify the `generate` methods within these adapters.
- **Question Formatting**: [QuestionFactory.ts](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/ai/QuestionFactory.ts)  
  Now uses **Zod Schema Parsing**. Instead of manual validation, it delegates to the schema defined in `src/interfaces/Question.ts`.

---

## 🔒 Schema-Driven Prompting (The Contract)

To prevent "AI Drift," the prompts and the code interfaces are tightly coupled via **Zod**.

- **Single Source of Truth**: [Question.ts](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/interfaces/Question.ts)  
  All question types are defined here using Zod schemas. 
- **Prompt Synchronization**: [PromptTemplate.ts](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/ai/PromptTemplate.ts)  
  Uses `zod-to-json-schema` to automatically inject the interface contract into the LLM system prompt. 
  > [!IMPORTANT]
  > If you change the `Question` interface, the prompt instructions sent to the AI will update **automatically** on next generation.

### Data Structure
Subject data is strictly separated into JSON files under `src/data/subjects/[subject_id]/`:
- `meta.json`: General configuration (Subject name, description, theme color).
- `questions.json`: The full question bank.
- `terminology.json`: Encyclopedia entries.

### Type Definitions
Update [Question.ts](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/interfaces/Question.ts) and `src/types/Subject.ts` to add new fields to the schema.

### Subject-Specific Styles
To add styles unique to a subject:
1. **Config-driven**: Add a property to `meta.json`.
2. **Page-level**: In [index.astro](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/pages/%5Bsubject%5D/index.astro), you can inject inline styles based on `subject.config` properties (e.g., dynamic CSS variables).

---

## 💅 Main Styles

- **Global Tokens**: [global.css](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/styles/global.css)  
  Contains CSS variables for colors, spacing, and the core design system.
- **UI Logic**: [main.css](file:///d:/Study/Programming/Projects/Finals/MoldV1/mold-astro/src/styles/main.css)  
  Contains component-specific styles (cards, buttons, headers).
- **Achievements Styling**: `src/styles/achievements.css`.
