/**
 * Achievement Repository - Manages achievement data persistence
 */

import { DatabaseService } from "../DatabaseService";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  condition: string;
}

export interface PlayerAchievement {
  id: number;
  playerId: number;
  achievementId: string;
  unlockedAt: number;
}

export class AchievementRepository {
  private static instance: AchievementRepository;

  private constructor() {}

  public static getInstance(): AchievementRepository {
    if (!AchievementRepository.instance) {
      AchievementRepository.instance = new AchievementRepository();
    }
    return AchievementRepository.instance;
  }

  private async getDB() {
    return await DatabaseService.getInstance();
  }

  /**
   * Get all achievements for a subject
   */
  public async getAchievementsBySubject(subjectId: string): Promise<Achievement[]> {
    const db = await this.getDB();
    const results = await db.query(
      "SELECT * FROM achievements WHERE subject_id = ?",
      [subjectId]
    );
    return results || [];
  }

  /**
   * Get all unlocked achievements for a player
   */
  public async getPlayerAchievements(playerId: number): Promise<PlayerAchievement[]> {
    const db = await this.getDB();
    const results = await db.query(
      "SELECT * FROM player_achievements WHERE player_id = ?",
      [playerId]
    );
    return results || [];
  }

  /**
   * Check if player has unlocked an achievement
   */
  public async hasAchievement(playerId: number, achievementId: string): Promise<boolean> {
    const db = await this.getDB();
    const results = await db.query(
      "SELECT id FROM player_achievements WHERE player_id = ? AND achievement_id = ?",
      [playerId, achievementId]
    );
    return results && results.length > 0;
  }

  /**
   * Unlock an achievement for a player
   */
  public async unlockAchievement(
    playerId: number,
    achievementId: string
  ): Promise<boolean> {
    // Check if already unlocked
    const hasIt = await this.hasAchievement(playerId, achievementId);
    if (hasIt) {
      return false; // Already unlocked
    }

    const db = await this.getDB();
    await db.run(
      "INSERT INTO player_achievements (player_id, achievement_id, unlocked_at) VALUES (?, ?, ?)",
      [playerId, achievementId, Date.now()]
    );

    return true; // Successfully unlocked
  }

  /**
   * Get achievement details by ID
   */
  public async getAchievement(achievementId: string): Promise<Achievement | null> {
    const db = await this.getDB();
    const results = await db.query(
      "SELECT * FROM achievements WHERE id = ?",
      [achievementId]
    );
    return results && results.length > 0 ? results[0] : null;
  }

  /**
   * Save achievement to database (for sync)
   */
  public async saveAchievement(achievement: Achievement, subjectId: string): Promise<void> {
    const db = await this.getDB();
    
    // Check if exists
    const existing = await this.getAchievement(achievement.id);
    
    if (existing) {
      // Update
      await db.run(
        "UPDATE achievements SET title = ?, description = ?, icon = ?, condition = ? WHERE id = ?",
        [achievement.title, achievement.description, achievement.icon || '', achievement.condition, achievement.id]
      );
    } else {
      // Insert
      await db.run(
        "INSERT INTO achievements (id, subject_id, title, description, icon, condition) VALUES (?, ?, ?, ?, ?, ?)",
        [achievement.id, subjectId, achievement.title, achievement.description, achievement.icon || '', achievement.condition]
      );
    }
  }

  /**
   * Get player achievement progress (total unlocked)
   */
  public async getPlayerProgress(playerId: number, subjectId?: string): Promise<{
    total: number;
    unlocked: number;
    percentage: number;
  }> {
    const db = await this.getDB();
    
    // Get total achievements
    let totalQuery = "SELECT COUNT(*) as count FROM achievements";
    const totalParams: any[] = [];
    
    if (subjectId) {
      totalQuery += " WHERE subject_id = ?";
      totalParams.push(subjectId);
    }
    
    const totalResult = await db.query(totalQuery, totalParams);
    const total = totalResult && totalResult.length > 0 ? totalResult[0].count : 0;
    
    // Get unlocked achievements
    let unlockedQuery = "SELECT COUNT(*) as count FROM player_achievements WHERE player_id = ?";
    const unlockedParams: any[] = [playerId];
    
    if (subjectId) {
      unlockedQuery += " AND achievement_id IN (SELECT id FROM achievements WHERE subject_id = ?)";
      unlockedParams.push(subjectId);
    }
    
    const unlockedResult = await db.query(unlockedQuery, unlockedParams);
    const unlocked = unlockedResult && unlockedResult.length > 0 ? unlockedResult[0].count : 0;
    
    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    };
  }
}
