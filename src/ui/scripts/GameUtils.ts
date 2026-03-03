export const GameUtils = {
    /**
     * Shuffles an array using the Fisher-Yates algorithm.
     * @param array The array to shuffle.
     * @returns The shuffled array.
     */
    shuffle<T>(array: T[]): T[] {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    /**
     * Formats seconds into MM:SS format.
     * @param seconds Total seconds.
     * @returns Formatted time string.
     */
    formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    /**
     * Formats a raw score into a percentage string.
     * @param score Current score/correct count.
     * @param total Total questions.
     * @returns Percentage string with symbol.
     */
    formatPercentage(score: number, total: number): string {
        if (total === 0) return '0%';
        return Math.round((score / total) * 100) + '%';
    },

    /**
     * Dispatches a custom event from the window object.
     * @deprecated Use eventBus from EventBus.ts instead for type safety
     */
    emit(eventName: string, detail: any = {}) {
        console.warn('[GameUtils] emit() is deprecated. Use eventBus from EventBus.ts instead.');
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
};
