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
  
  // Static cache to avoid DB queries on every page load (20-50ms saved)
  private static migrationChecked: boolean = false;
  private static migrationComplete: boolean = false;

  private constructor() {}

  public static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Check if migration has been completed (cached in memory)
   */
  public async isMigrationComplete(): Promise<boolean> {
    // Return cached result if already checked
    if (MigrationService.migrationChecked) {
      console.log('[MigrationService] Returning cached migration status:', MigrationService.migrationComplete);
      return MigrationService.migrationComplete;
    }

    try {
      const startTime = performance.now();
      const db = await DatabaseService.getInstance();
      const result = await db.query(
        "SELECT value FROM app_metadata WHERE key = 'migration_complete'"
      );
      
      MigrationService.migrationComplete = result && result.length > 0 && result[0].value === 'true';
      MigrationService.migrationChecked = true;
      
      const duration = performance.now() - startTime;
      console.log(`[MigrationService] Migration check took ${duration.toFixed(2)}ms`);
      
      return MigrationService.migrationComplete;
    } catch (error) {
      console.error('[MigrationService] Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Mark migration as complete and update cache
   */
  private async markMigrationComplete(): Promise<void> {
    try {
      const db = await DatabaseService.getInstance();
      await db.run(
        "INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('migration_complete', 'true')"
      );
      
      // Update static cache
      MigrationService.migrationComplete = true;
      MigrationService.migrationChecked = true;
      
      console.log('[MigrationService] Migration marked complete and cached');
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

      // Fetch all existing timestamps for this player to avoid N+1 query problem
      const existingTimestampsSet = new Set<number>();
      try {
        const existingRecords = await db.query(
          "SELECT timestamp FROM game_history WHERE player_id = ?",
          [player.id]
        );
        if (existingRecords) {
          for (const row of existingRecords) {
            existingTimestampsSet.add(row.timestamp);
          }
        }
      } catch (err) {
        console.error('[MigrationService] Error fetching existing game history:', err);
      }

      // Group records for bulk insert and calculate stats per subject
      const recordsToInsert = [];
      const subjectStats = new Map<string, { highScore: number; newRuns: number }>();

      for (const record of history) {
        // Skip if we already migrated this record
        if (existingTimestampsSet.has(record.timestamp)) {
          continue;
        }

        recordsToInsert.push(record);

        // Aggregate stats in memory
        const stats = subjectStats.get(record.subject) || { highScore: 0, newRuns: 0 };
        stats.highScore = Math.max(stats.highScore, record.score);
        stats.newRuns += 1;
        subjectStats.set(record.subject, stats);
      }

      if (recordsToInsert.length > 0) {
        // Insert game records in batches to avoid SQLite parameter limits
        const batchSize = 50;
        for (let i = 0; i < recordsToInsert.length; i += batchSize) {
          const batch = recordsToInsert.slice(i, i + batchSize);
          const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
          const values = batch.flatMap(record => [
            player.id,
            record.subject,
            record.mode,
            record.score,
            record.correct,
            record.incorrect,
            record.timestamp
          ]);

          try {
            await db.run(
              `INSERT INTO game_history
              (player_id, subject_id, mode, score, correct, incorrect, timestamp)
              VALUES ${placeholders}`,
              values
            );
          } catch (error) {
            console.error('[MigrationService] Error during bulk insert batch:', error);
          }
        }

        // Apply aggregated stats per subject
        for (const [subjectId, newStats] of subjectStats.entries()) {
          try {
            const existingStats = await playerRepo.getStats(player.id, subjectId);
            if (existingStats) {
              const mergedHighScore = Math.max(existingStats.high_score, newStats.highScore);
              await playerRepo.saveStats(
                player.id,
                subjectId,
                mergedHighScore,
                existingStats.total_runs + newStats.newRuns
              );
            } else {
              await playerRepo.saveStats(
                player.id,
                subjectId,
                newStats.highScore,
                newStats.newRuns
              );
            }
          } catch (error) {
            console.error(`[MigrationService] Error updating stats for subject ${subjectId}:`, error);
          }
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
        try {
          // Fetch all previously unlocked achievements for this player
          const existingRows = await db.query(
            "SELECT achievement_id FROM player_achievements WHERE player_id = ?",
            [player.id]
          );

          // Create a Set for fast membership checks
          const unlockedSet = new Set(existingRows.map((r: any) => r.achievement_id));

          for (const achievementId of progress.achievements) {
            try {
              if (!unlockedSet.has(achievementId)) {
                await db.run(
                  "INSERT INTO player_achievements (player_id, achievement_id, unlocked_at) VALUES (?, ?, ?)",
                  [player.id, achievementId, Date.now()]
                );
                // Add to set to prevent duplicate inserts in the same migration run
                unlockedSet.add(achievementId);
              }
            } catch (error) {
              console.error('[MigrationService] Error migrating achievement:', error);
            }
          }
        } catch (error) {
          console.error('[MigrationService] Error fetching existing achievements:', error);
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

      // Pre-fetch all existing flashcard progress for this player
      const existingProgress = await db.query(
        "SELECT flashcard_id FROM flashcard_progress WHERE player_id = ?",
        [player.id]
      );
      const existingFlashcardIds = new Set<string>();
      existingProgress?.forEach((row: any) => existingFlashcardIds.add(row.flashcard_id));

      for (const key of flashcardKeys) {
        try {
          const data = localStorage.getItem(key);
          if (!data) continue;

          const flashcardData = JSON.parse(data);
          const flashcardId = key.replace('flashcard_', '');

          // Check if progress already exists
          if (!existingFlashcardIds.has(flashcardId)) {
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
      
      // Clear static cache
      MigrationService.migrationComplete = false;
      MigrationService.migrationChecked = false;
      
      console.log('[MigrationService] Migration status reset and cache cleared.');
    } catch (error) {
      console.error('[MigrationService] Error resetting migration:', error);
    }
  }
}

export const migrationService = MigrationService.getInstance();
