# ⚡ Mold V2: Gamified Learning Platform

A powerful, extensible platform for mastering subjects through gamified quizzes, flashcards, and spaced repetition. Built with **Astro**.

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```sh
    npm install
    ```
2.  **Start Development Server**:
    ```sh
    npm run dev
    ```
3.  **Build for Production**:
    ```sh
    npm run build
    ```

---

## 📚 How to Add a New Subject ("Mold")

In this project, a "Mold" represents a specific subject (e.g., *Blockchain*, *Theory of Computation*). Each subject is self-contained in its own directory.

### Step 1: Create the Subject Directory
Navigate to `src/data/subjects/` and create a new folder for your subject. The folder name will serve as the unique ID for the subject (e.g., `MyNewSubject`).

### Step 2: Add `meta.json` (Required)
Create a `meta.json` file in your new folder. This defines the subject's display properties.

```json
{
  "config": {
    "title": "My New Subject",
    "description": "A brief description of what this subject covers.",
    "themeColor": "#3b82f6",
    "version": "1.0"
  },
  "subject": {
    "name": "My New Subject"
  }
}
```

### Step 3: Add Content Files
Add the following JSON files to populate your subject with data. You can skip any file if you don't have that content type yet.

#### `questions.json` (Quizzes)
Contains the question bank for the "Speedrun", "Blitz", etc. modes.

```json
[
  {
    "type": "mcq",
    "question": "What is the capital of France?",
    "explanation": "Paris is the capital and most populous city of France.",
    "category": "Geography",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correct": 2
  },
  {
    "type": "tf",
    "question": "The sky is green.",
    "explanation": "Rayleigh scattering causes the sky to appear blue.",
    "category": "Science",
    "correct": false
  }
]
```

#### `flashcards.json` (Memorization)
Contains cards for the Flashcard mode.

```json
[
  {
    "front": "HTTP",
    "back": "Hypertext Transfer Protocol",
    "type": "term"
  }
]
```

#### `terminology.json` (Encyclopedia)
Defines terms for the glossary/encyclopedia view.

```json
{
  "API": {
    "definition": "Application Programming Interface",
    "analogy": "Like a waiter in a restaurant taking your order to the kitchen."
  }
}
```

**That's it!** The application will automatically detect your new folder and add it to the Home Screen.

---

## 🎮 How to Add a New Game Mode

Game modes (e.g., "Speedrun", "Hardcore") are defined in the code to control how questions are selected and presented.

### Step 1: Open definition file
Open `src/data/subjects/Subject.ts`.

### Step 2: Add to `SUBJECT_MODES` Dictionary
Locate the `SUBJECT_MODES` export and add your new mode configuration.

```typescript
export const SUBJECT_MODES: Record<string, GameModeConfig> = {
    // ... existing modes ...
    
    mymode: {
        id: 'mymode',
        label: 'My Custom Mode',
        description: 'Describe your mode here',
        icon: '🚀', // Emoji or icon code
        
        // componentId determines the UI screen to use:
        // 'QuizScreen' -> Standard multiple choice/TF quiz layout
        // 'FlashcardScreen' -> Front/Back card swiping layout
        componentId: 'QuizScreen', 
        
        // Zod schema to validate data for this mode
        schema: z.array(QuestionSchema),
        
        // AI Prompt strategy (if using AI generation features)
        promptStrategy: (context) => `
            GOAL: Generate questions for My Custom Mode.
            STRATEGY: Focus on ...
            CONTEXT: ${context}
        `
    }
};
```

### Step 3: Verify
Save the file. Your new mode will automatically appear in the "Select Mode" section on the Home Screen for every subject.

---

## 🛠️ Project Structure

```text
/
├── src/
│   ├── components/    # Reusable UI components
│   ├── data/
│   │   └── subjects/  # <--- YOUR DATA LIVES HERE
│   │       ├── Subject.ts  # Game Mode definitions
│   │       └── [SubjectName]/
│   │           ├── meta.json
│   │           ├── questions.json
│   │           └── ...
│   ├── pages/         # Astro routes
│   └── layouts/       # Page layouts
└── public/            # Static assets
```
