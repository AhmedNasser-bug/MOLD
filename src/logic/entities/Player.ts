import { PlayerRepository } from "../../infrastructure/db/repositories/PlayerRepository";

export class Player {
    constructor(
        public readonly id: number,
        public name: string,
        private _exp: number
    ) { }

    get exp(): number { return this._exp; }

    public async addExp(amount: number): Promise<void> {
        this._exp += amount;
        await PlayerRepository.getInstance().updateExp(this.id, this._exp);
    }

    public async rename(newName: string): Promise<void> {
        this.name = newName;
        await PlayerRepository.getInstance().updateName(this.id, this.name);
    }

    public static async create(name: string): Promise<Player> {
        const repo = PlayerRepository.getInstance();
        const playerData = await repo.createPlayer(name);
        return new Player(playerData.id, playerData.name, playerData.exp);
    }

    public static async getById(id: number): Promise<Player | null> {
        const repo = PlayerRepository.getInstance();
        const playerData = await repo.getPlayer(id);
        if (!playerData) return null;
        return new Player(playerData.id, playerData.name, playerData.exp);
    }

    public static async getAll(): Promise<Player[]> {
        const repo = PlayerRepository.getInstance();
        const playerData = await repo.getAllPlayers();
        return playerData.map(data => new Player(data.id, data.name, data.exp));
    }

    public static async deletePlayer(id: number): Promise<void> {
        const repo = PlayerRepository.getInstance();
        await repo.deletePlayer(id);
    }
}
