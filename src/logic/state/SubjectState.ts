import type { SubjectData } from '../../data/subjects/Subject';

/**
 * Scoped State Store for active subjects.
 * Replaces the leaky `window.subjectData` global completely.
 * Data is held only while a subject is actively being studied/tested,
 * and gracefully cleared when exiting the subject.
 */
export class SubjectStateStore {
    private static instance: SubjectStateStore;
    private activeSubject: SubjectData | null = null;

    private constructor() { }

    public static getInstance(): SubjectStateStore {
        if (!SubjectStateStore.instance) {
            SubjectStateStore.instance = new SubjectStateStore();
        }
        return SubjectStateStore.instance;
    }

    /**
     * Loads a subject into active memory.
     */
    public setSubject(subject: SubjectData): void {
        this.activeSubject = subject;
    }

    /**
     * Gets the currently active subject.
     * @throws error if no subject is loaded, enforcing strict state availability.
     */
    public getSubject(): SubjectData {
        if (!this.activeSubject) {
            throw new Error("No active subject is loaded in the state store.");
        }
        return this.activeSubject;
    }

    /**
     * Clears the active subject from memory.
     * MUST be called when navigating back to the home screen or switching subjects.
     */
    public clear(): void {
        this.activeSubject = null;
    }

    public hasActiveSubject(): boolean {
        return this.activeSubject !== null;
    }
}

export const subjectState = SubjectStateStore.getInstance();
