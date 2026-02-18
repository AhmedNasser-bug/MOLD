
import type { Subject } from "../entities/Subject";
import type { Player } from "../entities/Player";
import type { GameConfig } from "../interfaces/GameConfig";
import { DatabaseService } from "../../infrastructure/db/DatabaseService";
import { GameStateMachine, GameStatus, type GameState } from "../state/GameState";
import { eventBus } from "../../infrastructure/events/EventBus";

/**
 * GameEngine - Manages game logic with state machine and event bus
 * 
 * Key improvements:
 * - Uses GameStateMachine for proper state management
 * - Emits typed events instead of callback-based state updates
 * - No direct window object manipulation
 * - Supports pause/resume functionality
 */
export class GameEngine {
    private questions: any[] = [];
    private stateMachine: GameStateMachine;
    private maxStreak: number = 0;
    private unsubscribeState?: () => void;

    constructor(
        private readonly subject: Subject,
        private readonly player: Player,
        private readonly config: GameConfig
    ) {
        // Initialize state machine
        this.stateMachine = new GameStateMachine({
            mode: config.mode,
            subject: subject.id,
            difficulty: config.settings.difficulty,
            timeLimit: config.settings.timeLimit,
            questionCount: 0, // Will be set after loading
        });

        // Subscribe to state changes and emit events
        this.unsubscribeState = this.stateMachine.subscribe((state) => {
            this.onStateChange(state);
        });
    }

    public async start() {
        // Load questions based on mode
        this.questions = await this.subject.loadQuestions();

        if (this.questions.length === 0) {
            console.warn("[GameEngine] No questions loaded.");
            this.endGame();
            return;
        }

        // Update state machine with question count
        const state = this.stateMachine.getState();
        state.stats.totalQuestions = this.questions.length;

        // Load first question
        this.loadQuestion(0);

        // Emit game start event
        await eventBus.emit('game:stats-update', {
            correct: 0,
            incorrect: 0,
            streak: 0,
            score: 0,
            totalQuestions: this.questions.length,
            currentQuestionIndex: 0,
        });
    }

    /**
     * Load a question and transition to READY state
     */
    private loadQuestion(index: number) {
        const question = this.questions[index];
        this.stateMachine.loadQuestion(question, index);

        // Emit question loaded event
        eventBus.emitSync('question:loaded', {
            questionIndex: index,
            totalQuestions: this.questions.length,
            question,
        });
    }

    /**
     * Submit an answer
     */
    public async submitAnswer(
        userAnswer: string | string[],
        correctAnswer: string | string[],
        isCorrect: boolean
    ) {
        const state = this.stateMachine.getState();

        // Prevent double submission
        if (state.isAnswered || state.status !== GameStatus.READY) {
            console.warn("[GameEngine] Cannot submit answer in current state");
            return;
        }

        // Submit to state machine
        this.stateMachine.submitAnswer(userAnswer, correctAnswer, isCorrect);

        // Calculate score
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }

        // Emit answer submitted event
        await eventBus.emit('answer:submitted', {
            questionId: state.currentQuestion?.id || '',
            userAnswer,
            isCorrect,
            correctAnswer,
        });

        // Emit feedback event
        await eventBus.emit('feedback:shown', {
            isCorrect,
            explanation: state.currentQuestion?.explanation,
        });
    }

    /**
     * Handle correct answer
     */
    private handleCorrectAnswer() {
        const state = this.stateMachine.getState();
        const newStreak = state.stats.streak;

        if (newStreak > this.maxStreak) {
            this.maxStreak = newStreak;
        }

        // Calculate score with combo multiplier
        const multiplier = 1 + (Math.floor(newStreak / 5) * 0.1);
        const points = Math.round(10 * multiplier);
        this.stateMachine.updateScore(points);
    }

    /**
     * Handle incorrect answer
     */
    private handleIncorrectAnswer() {
        // In survival mode, end game on first mistake
        if (this.config.settings.isSurvival) {
            setTimeout(() => this.endGame(), 2000); // Give time for feedback
        }
    }

    /**
     * Move to next question (called after feedback)
     */
    public async nextQuestion() {
        const state = this.stateMachine.getState();
        const nextIndex = state.stats.currentQuestionIndex + 1;

        if (nextIndex >= this.questions.length) {
            this.endGame();
        } else {
            this.loadQuestion(nextIndex);
        }
    }

    /**
     * Pause the game
     */
    public pause() {
        this.stateMachine.pause();
        eventBus.emitSync('game:pause', { paused: true });
    }

    /**
     * Resume the game
     */
    public resume(previousStatus: GameStatus = GameStatus.READY) {
        this.stateMachine.resume(previousStatus);
        eventBus.emitSync('game:pause', { paused: false });
    }

    /**
     * End the game
     */
    public async endGame() {
        this.stateMachine.complete();
        const state = this.stateMachine.getState();

        const totalTime = state.stats.endTime
            ? (state.stats.endTime - state.stats.startTime) / 1000
            : 0;

        // Save results to database
        await this.saveResults(state.stats.score, totalTime);

        // Emit game complete event
        await eventBus.emit('game:complete', {
            finalScore: state.stats.score,
            correct: state.stats.correct,
            incorrect: state.stats.incorrect,
            timeTaken: totalTime,
            mode: this.config.mode,
            subject: this.subject.id,
        });
    }

    /**
     * Save game results to database
     */
    private async saveResults(score: number, time: number) {
        try {
            // Update player experience
            await this.player.addExp(score);

            // Save stats to database
            const db = await DatabaseService.getInstance();
            const stats = await db.query(
                "SELECT * FROM player_stats WHERE player_id = ? AND subject_id = ?",
                [this.player.id, this.subject.id]
            );

            if (stats.length === 0) {
                await db.run(
                    "INSERT INTO player_stats (player_id, subject_id, high_score, total_runs, total_time) VALUES (?, ?, ?, 1, ?)",
                    [this.player.id, this.subject.id, score, time]
                );
            } else {
                const currentHigh = stats[0].high_score;
                const newHigh = Math.max(currentHigh, score);
                await db.run(
                    "UPDATE player_stats SET high_score = ?, total_runs = total_runs + 1, total_time = total_time + ? WHERE id = ?",
                    [newHigh, time, stats[0].id]
                );
            }

            // Emit player updated event
            await eventBus.emit('player:updated', {
                playerId: this.player.id,
                changes: {
                    totalScore: score,
                    gamesPlayed: 1,
                },
            });
        } catch (error) {
            console.error("[GameEngine] Error saving results:", error);
        }
    }

    /**
     * Handle state changes and emit appropriate events
     */
    private onStateChange(state: GameState) {
        // Emit stats update
        eventBus.emitSync('game:stats-update', {
            correct: state.stats.correct,
            incorrect: state.stats.incorrect,
            streak: state.stats.streak,
            score: state.stats.score,
            totalQuestions: state.stats.totalQuestions,
            currentQuestionIndex: state.stats.currentQuestionIndex,
        });

        // Emit state change
        eventBus.emitSync('game:state-change', {
            state: state.status,
        });
    }

    /**
     * Get current state
     */
    public getState(): Readonly<GameState> {
        return this.stateMachine.getState();
    }

    /**
     * Cleanup
     */
    public destroy() {
        if (this.unsubscribeState) {
            this.unsubscribeState();
        }
    }
}
