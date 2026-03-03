/**
 * Game State Machine for MOLD V2
 * 
 * Manages the game's state lifecycle with proper transitions
 */

export enum GameStatus {
  IDLE = 'IDLE',           // Initial state, no game active
  READY = 'READY',         // Question loaded, awaiting answer
  ANSWERING = 'ANSWERING', // User is selecting/entering answer
  FEEDBACK = 'FEEDBACK',   // Showing answer feedback
  PAUSED = 'PAUSED',       // Game paused
  COMPLETED = 'COMPLETED', // Game finished
}

export interface GameStats {
  correct: number;
  incorrect: number;
  streak: number;
  score: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  startTime: number;
  endTime?: number;
}

export interface GameConfig {
  mode: string;
  subject: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  questionCount?: number;
}

export interface GameState {
  status: GameStatus;
  config: GameConfig;
  stats: GameStats;
  currentQuestion: any | null;
  isPaused: boolean;
  isAnswered: boolean;
  lastAnswer: {
    isCorrect: boolean;
    userAnswer: string | string[];
    correctAnswer: string | string[];
  } | null;
}

/**
 * Valid state transitions
 */
const VALID_TRANSITIONS: Record<GameStatus, GameStatus[]> = {
  [GameStatus.IDLE]: [GameStatus.READY],
  [GameStatus.READY]: [GameStatus.ANSWERING, GameStatus.PAUSED, GameStatus.COMPLETED],
  [GameStatus.ANSWERING]: [GameStatus.FEEDBACK, GameStatus.PAUSED],
  [GameStatus.FEEDBACK]: [GameStatus.READY, GameStatus.COMPLETED, GameStatus.PAUSED],
  [GameStatus.PAUSED]: [GameStatus.READY, GameStatus.ANSWERING, GameStatus.FEEDBACK, GameStatus.COMPLETED],
  [GameStatus.COMPLETED]: [GameStatus.IDLE],
};

/**
 * State Machine for managing game state transitions
 */
export class GameStateMachine {
  private state: GameState;
  private listeners: Set<(state: GameState) => void> = new Set();

  constructor(config: GameConfig) {
    this.state = {
      status: GameStatus.IDLE,
      config,
      stats: {
        correct: 0,
        incorrect: 0,
        streak: 0,
        score: 0,
        totalQuestions: config.questionCount || 0,
        currentQuestionIndex: 0,
        startTime: Date.now(),
      },
      currentQuestion: null,
      isPaused: false,
      isAnswered: false,
      lastAnswer: null,
    };
  }

  /**
   * Get current state
   */
  public getState(): Readonly<GameState> {
    return { ...this.state };
  }

  /**
   * Get current status
   */
  public getStatus(): GameStatus {
    return this.state.status;
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Transition to a new state
   */
  public transition(newStatus: GameStatus): boolean {
    const currentStatus = this.state.status;

    // Check if transition is valid
    if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
      console.warn(
        `[GameStateMachine] Invalid transition: ${currentStatus} -> ${newStatus}`
      );
      return false;
    }

    // Update status
    this.state.status = newStatus;

    // Handle state-specific logic
    this.handleStateEnter(newStatus);

    // Notify listeners
    this.notifyListeners();

    return true;
  }

  /**
   * Load a new question
   */
  public loadQuestion(question: any, index: number): void {
    this.state.currentQuestion = question;
    this.state.stats.currentQuestionIndex = index;
    this.state.isAnswered = false;
    this.state.lastAnswer = null;
    this.transition(GameStatus.READY);
  }

  /**
   * Submit an answer
   */
  public submitAnswer(
    userAnswer: string | string[],
    correctAnswer: string | string[],
    isCorrect: boolean
  ): void {
    if (this.state.isAnswered) {
      console.warn('[GameStateMachine] Answer already submitted');
      return;
    }

    this.state.isAnswered = true;
    this.state.lastAnswer = { isCorrect, userAnswer, correctAnswer };

    // Update stats
    if (isCorrect) {
      this.state.stats.correct++;
      this.state.stats.streak++;
    } else {
      this.state.stats.incorrect++;
      this.state.stats.streak = 0;
    }

    // Transition to feedback
    this.transition(GameStatus.FEEDBACK);
  }

  /**
   * Update score
   */
  public updateScore(points: number): void {
    this.state.stats.score += points;
    this.notifyListeners();
  }

  /**
   * Pause game
   */
  public pause(): void {
    if (this.state.status !== GameStatus.COMPLETED) {
      this.state.isPaused = true;
      this.transition(GameStatus.PAUSED);
    }
  }

  /**
   * Resume game
   */
  public resume(previousStatus: GameStatus): void {
    if (this.state.status === GameStatus.PAUSED) {
      this.state.isPaused = false;
      this.transition(previousStatus);
    }
  }

  /**
   * Complete game
   */
  public complete(): void {
    this.state.stats.endTime = Date.now();
    this.transition(GameStatus.COMPLETED);
  }

  /**
   * Reset to initial state
   */
  public reset(): void {
    const config = this.state.config;
    this.state = {
      status: GameStatus.IDLE,
      config,
      stats: {
        correct: 0,
        incorrect: 0,
        streak: 0,
        score: 0,
        totalQuestions: config.questionCount || 0,
        currentQuestionIndex: 0,
        startTime: Date.now(),
      },
      currentQuestion: null,
      isPaused: false,
      isAnswered: false,
      lastAnswer: null,
    };
    this.notifyListeners();
  }

  /**
   * Handle state entry logic
   */
  private handleStateEnter(status: GameStatus): void {
    switch (status) {
      case GameStatus.COMPLETED:
        // Ensure end time is set
        if (!this.state.stats.endTime) {
          this.state.stats.endTime = Date.now();
        }
        break;
      // Add more state-specific logic as needed
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (error) {
        console.error('[GameStateMachine] Listener error:', error);
      }
    }
  }
}
