/**
 * Migration Service - Handles localStorage to SQLite migration
 * 
 * Purpose:
 * - Migrate existing localStorage data to SQLite database
 * - Ensure backward compatibility during transition
 * - Clean up localStorage after successful migration
 */

import { DatabaseService } from './DatabaseService';
import { PlayerRepository } from './repositories/PlayerRepository';

interface LegacyProgress {
  subject: string;
  mode: string;
  score: number;
  correct: number;
  incorrect: number;
  timestamp: number;
}

interface LegacyUserProgress {
  achievements: string[];
  totalScore: number;
  gamesPlayed: number;
}

export class MigrationService {
  private static instance: MigrationService;
  private migrationComplete: boolean = false;

  private constructor() {}

  public static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Check if migration has been completed
   */
  public async isMigrationComplete(): Promise<boolean> {
    if (this.migrationComplete) return true;

    try {
      const db = await DatabaseService.getInstance();
      const result = await db.query(
        "SELECT value FROM app_metadata WHERE key = 'migration_complete'"
      );
      this.migrationComplete = result && result.length > 0 && result[0].value === 'true';
      return this.migrationComplete;
    } catch (error) {
      console.error('[MigrationService] Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Mark migration as complete
   */
  private async markMigrationComplete(): Promise<void> {
    try {
      const db = await DatabaseService.getInstance();
      await db.run(
        "INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('migration_complete', 'true')"
      );
      this.migrationComplete = true;
    } catch (error) {
      console.error('[MigrationService] Error marking migration complete:', error);
    }
  }

  /**
   * Main migration entry point
   */
  public async migrate(): Promise<void> {
    console.log('[MigrationService] Starting migration from localStorage to SQLite...');

    const complete = await this.isMigrationComplete();
    if (complete) {
      console.log('[MigrationService] Migration already completed.');
      return;
    }

    try {
      // Migrate game progress history
      await this.migrateGameProgress();

      // Migrate user progress (achievements, stats)
      await this.migrateUserProgress();

      // Migrate flashcard progress
      await this.migrateFlashcardProgress();

      // Mark migration as complete
      await this.markMigrationComplete();

      // Clean up localStorage (optional - keep for now as backup)
      // this.cleanupLocalStorage();

      console.log('[MigrationService] Migration completed successfully!');
    } catch (error) {
      console.error('[MigrationService] Migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate game progress from localStorage
   */
  private async migrateGameProgress(): Promise<void> {
    const historyKey = 'gameHistory';
    const historyData = localStorage.getItem(historyKey);

    if (!historyData) {
      console.log('[MigrationService] No game history to migrate.');
      return;
    }

    try {
      const history: LegacyProgress[] = JSON.parse(historyData);
      const db = await DatabaseService.getInstance();
      const playerRepo = PlayerRepository.getInstance();

      // Get or create default player for legacy data
      let player = await playerRepo.getPlayerByName('Legacy Player');
      if (!player) {
        player = await playerRepo.createPlayer('Legacy Player');
      }

      console.log(`[MigrationService] Migrating ${history.length} game records...`);

      for (const record of history) {
        try {
          // Check if this game already exists (by timestamp)
          const existing = await db.query(
            "SELECT id FROM game_history WHERE player_id = ? AND timestamp = ?",
            [player.id, record.timestamp]
          );

          if (existing && existing.length > 0) {
            continue; // Skip duplicates
          }

          // Insert game record
          await db.run(
            `INSERT INTO game_history 
            (player_id, subject_id, mode, score, correct, incorrect, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              player.id,
              record.subject,
              record.mode,
              record.score,
              record.correct,
              record.incorrect,
              record.timestamp
            ]
          );

          // Update player stats for this subject
          const stats = await playerRepo.getStats(player.id, record.subject);
          if (stats) {
            const newHighScore = Math.max(stats.high_score, record.score);
            await playerRepo.saveStats(
              player.id,
              record.subject,
              newHighScore,
              stats.total_runs + 1
            );
          } else {
            await playerRepo.saveStats(player.id, record.subject, record.score, 1);
          }
        } catch (error) {
          console.error('[MigrationService] Error migrating game record:', error);
        }
      }

      console.log('[MigrationService] Game progress migration complete.');
    } catch (error) {
      console.error('[MigrationService] Error parsing game history:', error);
    }
  }

  /**
   * Migrate user progress (achievements, total stats)
   */
  private async migrateUserProgress(): Promise<void> {
    const progressKey = 'userProgress';
    const progressData = localStorage.getItem(progressKey);

    if (!progressData) {
      console.log('[MigrationService] No user progress to migrate.');
      return;
    }

    try {
      const progress: LegacyUserProgress = JSON.parse(progressData);
      const db = await DatabaseService.getInstance();
      const playerRepo = PlayerRepository.getInstance();

      // Get or create default player
      let player = await playerRepo.getPlayerByName('Legacy Player');
      if (!player) {
        player = await playerRepo.createPlayer('Legacy Player');
      }

      // Update player exp based on total score
      if (progress.totalScore > 0) {
        await playerRepo.updateExp(player.id, progress.totalScore);
      }

      // Migrate achievements
      if (progress.achievements && progress.achievements.length > 0) {
        for (const achievementId of progress.achievements) {
          try {
            // Check if achievement already unlocked
            const existing = await db.query(
              "SELECT id FROM player_achievements WHERE player_id = ? AND achievement_id = ?",
              [player.id, achievementId]
            );

            if (existing && existing.length === 0) {
              await db.run(
                "INSERT INTO player_achievements (player_id, achievement_id, unlocked_at) VALUES (?, ?, ?)",
                [player.id, achievementId, Date.now()]
              );
            }
          } catch (error) {
            console.error('[MigrationService] Error migrating achievement:', error);
          }
        }
      }

      console.log('[MigrationService] User progress migration complete.');
    } catch (error) {
      console.error('[MigrationService] Error parsing user progress:', error);
    }
  }

  /**
   * Migrate flashcard progress
   */
  private async migrateFlashcardProgress(): Promise<void> {
    const flashcardKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('flashcard_')
    );

    if (flashcardKeys.length === 0) {
      console.log('[MigrationService] No flashcard progress to migrate.');
      return;
    }

    try {
      const db = await DatabaseService.getInstance();
      const playerRepo = PlayerRepository.getInstance();

      // Get or create default player
      let player = await playerRepo.getPlayerByName('Legacy Player');
      if (!player) {
        player = await playerRepo.createPlayer('Legacy Player');
      }

      for (const key of flashcardKeys) {
        try {
          const data = localStorage.getItem(key);
          if (!data) continue;

          const flashcardData = JSON.parse(data);
          const flashcardId = key.replace('flashcard_', '');

          // Check if progress already exists
          const existing = await db.query(
            "SELECT id FROM flashcard_progress WHERE player_id = ? AND flashcard_id = ?",
            [player.id, flashcardId]
          );

          if (existing && existing.length === 0) {
            await db.run(
              `INSERT INTO flashcard_progress 
              (player_id, flashcard_id, mastery_level, last_reviewed, next_review) 
              VALUES (?, ?, ?, ?, ?)`,
              [
                player.id,
                flashcardId,
                flashcardData.masteryLevel || 0,
                flashcardData.lastReviewed || Date.now(),
                flashcardData.nextReview || Date.now()
              ]
            );
          }
        } catch (error) {
          console.error('[MigrationService] Error migrating flashcard:', error);
        }
      }

      console.log('[MigrationService] Flashcard progress migration complete.');
    } catch (error) {
      console.error('[MigrationService] Error migrating flashcards:', error);
    }
  }

  /**
   * Clean up localStorage after successful migration (use with caution)
   */
  private cleanupLocalStorage(): void {
    console.log('[MigrationService] Cleaning up localStorage...');

    const keysToRemove = [
      'gameHistory',
      'userProgress',
      ...Object.keys(localStorage).filter(key => key.startsWith('flashcard_'))
    ];

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    console.log('[MigrationService] localStorage cleanup complete.');
  }

  /**
   * Force re-migration (for development/debugging)
   */
  public async resetMigration(): Promise<void> {
    try {
      const db = await DatabaseService.getInstance();
      await db.run("DELETE FROM app_metadata WHERE key = 'migration_complete'");
      this.migrationComplete = false;
      console.log('[MigrationService] Migration status reset.');
    } catch (error) {
      console.error('[MigrationService] Error resetting migration:', error);
    }
  }
}

export const migrationService = MigrationService.getInstance();
