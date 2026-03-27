/**
 * Central Event Type Definitions for MOLD V2
 * All events in the application are defined here with typed payloads
 */

// ============================================================================
// Game State Events
// ============================================================================

export interface GameStartEvent {
  mode: string;
  category?: string | null;
}

export interface GameStateChangeEvent {
  state: 'READY' | 'ANSWERING' | 'FEEDBACK' | 'PAUSED' | 'COMPLETED';
  previousState?: 'READY' | 'ANSWERING' | 'FEEDBACK' | 'PAUSED' | 'COMPLETED';
}

export interface GameStatsUpdateEvent {
  correct: number;
  incorrect: number;
  streak: number;
  score: number;
  totalQuestions: number;
  currentQuestionIndex: number;
}

export interface GameTimeUpdateEvent {
  elapsed: number;
  remaining?: number;
}

export interface GamePauseEvent {
  paused: boolean;
}

export interface GameCompleteEvent {
  finalScore: number;
  correct: number;
  incorrect: number;
  timeTaken: number;
  mode: string;
  subject: string;
}

export interface GameResultsEvent {
  score: number;
  total: number;
  time: number;
  answers: any[];
  maxStreak: number;
  mode?: string;
}

// ============================================================================
// Question Events
// ============================================================================

export interface QuestionLoadedEvent {
  questionIndex: number;
  totalQuestions: number;
  question: any; // Will be typed from Question schema
}

export interface AnswerSubmittedEvent {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  correctAnswer: string | string[];
}

export interface FeedbackShownEvent {
  isCorrect: boolean;
  explanation?: string;
}

export interface NextQuestionRequestEvent {
  currentIndex: number;
}

// ============================================================================
// UI Events
// ============================================================================

export interface ScreenChangeEvent {
  from: string;
  to: string;
}

export interface ModeSelectedEvent {
  mode: string;
  subjectId: string;
}

export interface DifficultySelectedEvent {
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface NavigateHomeEvent {
  preserveState?: boolean;
}

// ============================================================================
// Player Events
// ============================================================================

export interface PlayerUpdatedEvent {
  playerId: number;
  changes: {
    totalScore?: number;
    gamesPlayed?: number;
    achievements?: string[];
  };
}

export interface AchievementUnlockedEvent {
  achievementId: string;
  title: string;
  description: string;
}

// ============================================================================
// Data Events
// ============================================================================

export interface DataSyncStartEvent {
  syncType: 'subjects' | 'achievements' | 'full';
}

export interface DataSyncCompleteEvent {
  syncType: 'subjects' | 'achievements' | 'full';
  itemsProcessed: number;
  errors?: string[];
}

export interface DatabaseReadyEvent {
  hasExistingData: boolean;
}

// ============================================================================
// Event Map (for type-safe event bus)
// ============================================================================

export interface EventMap {
  // Game State
  'game:start': GameStartEvent;
  'game:state-change': GameStateChangeEvent;
  'game:stats-update': GameStatsUpdateEvent;
  'game:time-update': GameTimeUpdateEvent;
  'game:pause': GamePauseEvent;
  'game:complete': GameCompleteEvent;
  'game:results': GameResultsEvent;

  // Questions
  'question:loaded': QuestionLoadedEvent;
  'answer:submitted': AnswerSubmittedEvent;
  'feedback:shown': FeedbackShownEvent;
  'question:next': NextQuestionRequestEvent;

  // UI
  'screen:change': ScreenChangeEvent;
  'mode:selected': ModeSelectedEvent;
  'difficulty:selected': DifficultySelectedEvent;
  'navigate:home': NavigateHomeEvent;

  // Player
  'player:updated': PlayerUpdatedEvent;
  'achievement:unlocked': AchievementUnlockedEvent;

  // Data
  'data:sync-start': DataSyncStartEvent;
  'data:sync-complete': DataSyncCompleteEvent;
  'database:ready': DatabaseReadyEvent;
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type EventHandler<T = any> = (payload: T) => void | Promise<void>;

export type EventKey = keyof EventMap;
