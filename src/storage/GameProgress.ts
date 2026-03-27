
export interface RunResult {
    date: number;
    mode: string;
    score: number; // percentage
    rawScore: number;
    total: number;
    time: number;
    streak: number;
}

export class GameProgressService {
    private static STORAGE_KEY_PREFIX = 'mold_game_';

    private static getStorageKey(subjectId: string): string {
        return `${this.STORAGE_KEY_PREFIX}${subjectId}`;
    }

    static loadEncoded(subjectId: string) {
        try {
            // Check direct subject ID key first (Legacy support from HomeScreen)
            let data = localStorage.getItem(subjectId);
            if (!data) {
                // Try prefixed
                data = localStorage.getItem(this.getStorageKey(subjectId));
            }

            if (data) return JSON.parse(data);
        } catch (e) { console.error(e); }

        return { runs: [], bestScore: 0, bestStreak: 0, achievements: [] };
    }

    static save(subjectId: string, data: any) {
        // Saving to both keys to maintain compatibility if HomeScreen uses subject.config.storageKey
        // Ideally we standardise. For now, save to the ID logic HomeScreen uses.
        // HomeScreen uses: this.subject.config.storageKey || this.subject.id

        try {
            localStorage.setItem(subjectId, JSON.stringify(data));
        } catch (e) { }
    }

    static addRun(subjectId: string, run: RunResult, subjectAchievements: any[]) {
        const data = this.loadEncoded(subjectId);

        data.runs.push(run);

        // Update Stats
        if (run.score > data.bestScore) data.bestScore = run.score;
        if (run.streak > data.bestStreak) data.bestStreak = run.streak;

        // Check Achievements
        const newUnlocks = this.checkAchievements(run, data, subjectAchievements);
        if (newUnlocks.length > 0) {
            data.achievements = [...(data.achievements || []), ...newUnlocks];
        }

        this.save(subjectId, data);

        return {
            ...data,
            newUnlocks
        };
    }

    private static checkAchievements(run: RunResult, allData: any, definedAchievements: any[]): string[] {
        const unlocked = allData.achievements || [];
        const newUnlocks: string[] = [];

        definedAchievements.forEach((ach: any) => {
            if (unlocked.includes(ach.id)) return;

            let qualified = false;
            // Basic implementation of conditions based on ID or custom logic
            // Ideally 'ach' object has a 'condition' function or declarative rule.
            // Since we don't have that schema visible, we'll infer standard ones or skip.

            // Example inference based on ID/Description keywords
            const id = ach.id.toLowerCase();
            const desc = ach.description.toLowerCase();

            if (id.includes('speed') && run.time < 60 && run.score === 100) qualified = true;
            if (id.includes('streak') && run.streak >= 10) qualified = true;
            if (id.includes('flawless') && run.score === 100) qualified = true;
            if (id.includes('survivor') && run.mode === 'survival' && run.rawScore > 10) qualified = true;
            if (id.includes('first') && allData.runs.length === 1) qualified = true;

            // Simple condition mapping - expandable in future

            if (qualified) {
                newUnlocks.push(ach.id);
            }
        });

        return newUnlocks;
    }
}
