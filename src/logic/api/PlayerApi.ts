import { z } from 'zod';
import { BaseApiFacade } from './BaseApiFacade';
import { PlayerRepository } from '../../infrastructure/db/repositories/PlayerRepository';

const CreatePlayerSchema = z.object({
    name: z.string().min(1, "Name must not be empty").max(50, "Name too long")
});

const UpdateExpSchema = z.object({
    playerId: z.number().int().positive(),
    exp: z.number().int().nonnegative()
});

export class PlayerApi extends BaseApiFacade {
    private static instance: PlayerApi;
    private playerRepo = PlayerRepository.getInstance();

    private constructor() { super(); }

    public static getInstance(): PlayerApi {
        if (!PlayerApi.instance) {
            PlayerApi.instance = new PlayerApi();
        }
        return PlayerApi.instance;
    }

    public async createPlayer(payload: unknown) {
        const data = this.validate(CreatePlayerSchema, payload, 'Player');
        return await this.playerRepo.createPlayer(data.name);
    }

    public async updatePlayerExp(payload: unknown) {
        const data = this.validate(UpdateExpSchema, payload, 'PlayerExp');
        return await this.playerRepo.updateExp(data.playerId, data.exp);
    }

    public async getPlayer(id: number) {
        return await this.playerRepo.getPlayer(id);
    }

    public async getPlayerByName(name: string) {
        return await this.playerRepo.getPlayerByName(name);
    }
}

export const playerApi = PlayerApi.getInstance();
