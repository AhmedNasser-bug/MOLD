import { z } from 'zod';
import { BaseApiFacade } from './BaseApiFacade';
import { AchievementRepository } from '../../infrastructure/db/repositories/AchievementRepository';

const UnlockAchievementSchema = z.object({
    playerId: z.number().int().positive(),
    achievementId: z.string().min(1)
});

export class AchievementApi extends BaseApiFacade {
    private static instance: AchievementApi;
    private achievementRepo = AchievementRepository.getInstance();

    private constructor() { super(); }

    public static getInstance(): AchievementApi {
        if (!AchievementApi.instance) {
            AchievementApi.instance = new AchievementApi();
        }
        return AchievementApi.instance;
    }

    public async unlockAchievement(payload: unknown) {
        const data = this.validate(UnlockAchievementSchema, payload, 'Achievement');
        return await this.achievementRepo.unlockAchievement(data.playerId, data.achievementId);
    }

    public async getPlayerAchievements(playerId: number) {
        return await this.achievementRepo.getPlayerAchievements(playerId);
    }

    public async getPlayerProgress(playerId: number, subjectId?: string) {
        return await this.achievementRepo.getPlayerProgress(playerId, subjectId);
    }

    public async getAchievementsBySubject(subjectId: string) {
        return await this.achievementRepo.getAchievementsBySubject(subjectId);
    }
}

export const achievementApi = AchievementApi.getInstance();
