import { z } from 'zod';
import { BaseApiFacade } from './BaseApiFacade';
import { GameHistoryRepository } from '../../infrastructure/db/repositories/GameHistoryRepository';
import { PlayerRepository } from '../../infrastructure/db/repositories/PlayerRepository';

const SaveGameSchema = z.object({
    playerId: z.number().int().positive(),
    subjectId: z.string().min(1),
    mode: z.string().min(1),
    score: z.number().int().nonnegative(),
    correct: z.number().int().nonnegative(),
    incorrect: z.number().int().nonnegative(),
    timeTaken: z.number().int().nonnegative().default(0),
    timestamp: z.number().int().positive().default(() => Date.now())
});

export class GameApi extends BaseApiFacade {
    private static instance: GameApi;
    private historyRepo = GameHistoryRepository.getInstance();
    private playerRepo = PlayerRepository.getInstance();

    private constructor() { super(); }

    public static getInstance(): GameApi {
        if (!GameApi.instance) {
            GameApi.instance = new GameApi();
        }
        return GameApi.instance;
    }

    /**
     * Safely executes a multi-repository update when a game session finishes.
     * Prevents partial updates or data corruption if one query fails.
     */
    public async saveGameSession(payload: unknown) {
        const data = this.validate(SaveGameSchema, payload, 'GameSession');

        return await this.withTransaction(async (uow) => {
            // 1. Save the individual game history record
            const gameId = await this.historyRepo.saveGame(data as any);

            // 2. Recalculate full player statistics based on the new game
            const stats = await this.historyRepo.getPlayerStats(data.playerId, data.subjectId);

            // 3. Update the aggregate player_stats table
            await this.playerRepo.saveStats(
                data.playerId,
                data.subjectId,
                stats.highScore,
                stats.totalGames
            );

            // 4. Reward global experience points to the player profile
            const player = await this.playerRepo.getPlayer(data.playerId);
            if (player) {
                const newExp = (player.exp || 0) + data.score;
                await this.playerRepo.updateExp(data.playerId, newExp);
            }

            return gameId;
        });
    }

    public async getRecentGames(limit: number = 10) {
        return await this.historyRepo.getRecentGames(limit);
    }

    public async getPlayerStats(playerId: number, subjectId?: string) {
        return await this.historyRepo.getPlayerStats(playerId, subjectId);
    }

    public async getPlayerHistory(playerId: number, limit?: number) {
        return await this.historyRepo.getPlayerHistory(playerId, limit);
    }

    public async getSubjectHistory(playerId: number, subjectId: string, limit?: number) {
        return await this.historyRepo.getSubjectHistory(playerId, subjectId, limit);
    }
}

export const gameApi = GameApi.getInstance();
