/**
 * Game History Repository - Manages game session history
 */

import { DatabaseService } from "../DatabaseService";

export interface GameHistory {
  id?: number;
  playerId: number;
  subjectId: string;
  mode: string;
  score: number;
  correct: number;
  incorrect: number;
  timeTaken?: number;
  timestamp: number;
}

export interface GameStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  highScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracy: number;
}

export class GameHistoryRepository {
  private static instance: GameHistoryRepository;

  private constructor() {}

  public static getInstance(): GameHistoryRepository {
    if (!GameHistoryRepository.instance) {
      GameHistoryRepository.instance = new GameHistoryRepository();
    }
    return GameHistoryRepository.instance;
  }

  private async getDB() {
    return await DatabaseService.getInstance();
  }

  /**
   * Save a game session to history
   */
  public async saveGame(game: GameHistory): Promise<number> {
    const db = await this.getDB();
    
    const result = await db.run(
      `INSERT INTO game_history 
      (player_id, subject_id, mode, score, correct, incorrect, time_taken, timestamp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        game.playerId,
        game.subjectId,
        game.mode,
        game.score,
        game.correct,
        game.incorrect,
        game.timeTaken || 0,
        game.timestamp || Date.now()
      ]
    );

    return result?.lastInsertRowid || 0;
  }

  /**
   * Get all game history for a player
   */
  public async getPlayerHistory(
    playerId: number,
    limit?: number
  ): Promise<GameHistory[]> {
    const db = await this.getDB();
    
    let query = "SELECT * FROM game_history WHERE player_id = ? ORDER BY timestamp DESC";
    const params: any[] = [playerId];
    
    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
    }
    
    const results = await db.query(query, params);
    return results || [];
  }

  /**
   * Get game history for a specific subject
   */
  public async getSubjectHistory(
    playerId: number,
    subjectId: string,
    limit?: number
  ): Promise<GameHistory[]> {
    const db = await this.getDB();
    
    let query = "SELECT * FROM game_history WHERE player_id = ? AND subject_id = ? ORDER BY timestamp DESC";
    const params: any[] = [playerId, subjectId];
    
    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
    }
    
    const results = await db.query(query, params);
    return results || [];
  }

  /**
   * Get game history for a specific mode
   */
  public async getModeHistory(
    playerId: number,
    mode: string,
    limit?: number
  ): Promise<GameHistory[]> {
    const db = await this.getDB();
    
    let query = "SELECT * FROM game_history WHERE player_id = ? AND mode = ? ORDER BY timestamp DESC";
    const params: any[] = [playerId, mode];
    
    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
    }
    
    const results = await db.query(query, params);
    return results || [];
  }

  /**
   * Get recent games (last N games)
   */
  public async getRecentGames(limit: number = 10): Promise<GameHistory[]> {
    const db = await this.getDB();
    
    const results = await db.query(
      "SELECT * FROM game_history ORDER BY timestamp DESC LIMIT ?",
      [limit]
    );
    
    return results || [];
  }

  /**
   * Get player statistics
   */
  public async getPlayerStats(
    playerId: number,
    subjectId?: string
  ): Promise<GameStats> {
    const db = await this.getDB();
    
    let query = `
      SELECT 
        COUNT(*) as totalGames,
        SUM(score) as totalScore,
        AVG(score) as averageScore,
        MAX(score) as highScore,
        SUM(correct) as totalCorrect,
        SUM(incorrect) as totalIncorrect
      FROM game_history 
      WHERE player_id = ?
    `;
    
    const params: any[] = [playerId];
    
    if (subjectId) {
      query += " AND subject_id = ?";
      params.push(subjectId);
    }
    
    const results = await db.query(query, params);
    
    if (!results || results.length === 0) {
      return {
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        highScore: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        accuracy: 0,
      };
    }
    
    const stats = results[0];
    const totalAttempts = stats.totalCorrect + stats.totalIncorrect;
    const accuracy = totalAttempts > 0 ? (stats.totalCorrect / totalAttempts) * 100 : 0;
    
    return {
      totalGames: stats.totalGames || 0,
      totalScore: stats.totalScore || 0,
      averageScore: Math.round(stats.averageScore || 0),
      highScore: stats.highScore || 0,
      totalCorrect: stats.totalCorrect || 0,
      totalIncorrect: stats.totalIncorrect || 0,
      accuracy: Math.round(accuracy),
    };
  }

  /**
   * Delete game history for a player
   */
  public async deletePlayerHistory(playerId: number): Promise<void> {
    const db = await this.getDB();
    await db.run("DELETE FROM game_history WHERE player_id = ?", [playerId]);
  }

  /**
   * Get leaderboard for a subject
   */
  public async getLeaderboard(
    subjectId: string,
    mode?: string,
    limit: number = 10
  ): Promise<Array<{
    playerId: number;
    playerName: string;
    highScore: number;
    totalGames: number;
  }>> {
    const db = await this.getDB();
    
    let query = `
      SELECT 
        gh.player_id as playerId,
        p.name as playerName,
        MAX(gh.score) as highScore,
        COUNT(*) as totalGames
      FROM game_history gh
      JOIN player p ON gh.player_id = p.id
      WHERE gh.subject_id = ?
    `;
    
    const params: any[] = [subjectId];
    
    if (mode) {
      query += " AND gh.mode = ?";
      params.push(mode);
    }
    
    query += " GROUP BY gh.player_id ORDER BY highScore DESC LIMIT ?";
    params.push(limit);
    
    const results = await db.query(query, params);
    return results || [];
  }

  /**
   * Get play frequency (games per day for last N days)
   */
  public async getPlayFrequency(
    playerId: number,
    days: number = 7
  ): Promise<Array<{ date: string; count: number }>> {
    const db = await this.getDB();
    
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const results = await db.query(
      `SELECT 
        date(timestamp / 1000, 'unixepoch') as date,
        COUNT(*) as count
      FROM game_history
      WHERE player_id = ? AND timestamp >= ?
      GROUP BY date
      ORDER BY date DESC`,
      [playerId, cutoffTime]
    );
    
    return results || [];
  }
}
