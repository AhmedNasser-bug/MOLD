# Phase 1: Data Model & Event Contracts

Even though storage is not affected, replacing direct method calls requires establishing strict event contracts on the EventBus.

## Event Interfaces

### 1. `game:start`
Fired by `HomeScreen.astro` to initialize a game mode.
```typescript
interface GameStartPayload {
  mode: 'speedrun' | 'blitz' | 'hardcore' | 'exam' | 'practice' | 'flashcards-term' | 'flashcards-bank';
  config: GameConfig;
  subjectData: SubjectData;
}
```

### 2. `game:complete`
Fired by the `GameEngine` or specific Screen Controllers upon end states.
```typescript
interface GameCompletePayload {
  score: number;
  total: number;
  time: number;
  answers: any[];
  maxStreak: number;
  mode: string;
}
```

### 3. `routing:navigate`
Fired by elements like `BackButton.astro` or modes requesting screen changes (e.g., to `/results`).
```typescript
interface NavigatePayload {
  target: 'home' | 'results' | 'revision' | 'achievements';
  data?: any; // e.g. GameCompletePayload when moving to results
}
```
