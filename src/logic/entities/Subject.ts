
import { DataSyncService } from "../services/DataSyncService";
import { SubjectRepository } from "../../infrastructure/db/repositories/SubjectRepository";
import { DatabaseService } from "../../infrastructure/db/DatabaseService";

export class Subject {
    private _questions: any[] = [];
    private _dataLoaded: boolean = false;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly subjectApiUri: string = "" // Optional now, sourced from DB/Sync
    ) { }

    /**
     * Synchronizes subject data from API to Local DB.
     * MUST be called before any gameplay if data is missing.
     */
    public async sync(): Promise<boolean> {
        return await DataSyncService.syncSubject(this.id);
    }

    /**
     * Loads questions purely from the Local Database.
     * Enforces Offline-First.
     */
    public async loadFromDB(): Promise<any[]> {
        const repo = SubjectRepository.getInstance();
        try {
            // Load Metadata & Extras
            const data = await repo.getSubjectData(this.id);

            if (data) {
                // Populate Questions
                this._questions = await repo.getQuestionsForSubject(this.id);
                this._dataLoaded = true;

                // Populate Extras in Memory
                (this as any)._terminology = data.terminology || [];
                (this as any)._flashcards = data.flashcards || [];

                console.log(`[Subject] Loaded for '${this.id}': ${this._questions.length} questions, ${(this as any)._terminology.length} terms.`);

                // ALWAYS populate window.subjectData if data was found, regardless of question count
                // This ensures Encyclopedia words even if questions are broken/empty
                // @ts-ignore
                window.subjectData = {
                    id: this.id,
                    name: this.name,
                    questions: this._questions,
                    terminology: (this as any)._terminology,
                    flashcards: (this as any)._flashcards,
                    meta: {}
                };

                if (this._questions.length > 0) {
                    return this._questions;
                } else {
                    console.warn(`[Subject] WARNING: Questions array is empty for '${this.id}'. Game modes will fail.`);
                }
            }

            console.warn(`[Subject] No data found in DB for ${this.id}. Run sync() first.`);
            return [];

        } catch (e) {
            console.error("[Subject] DB Load failed", e);
            return [];
        }
    }

    public async loadQuestions(): Promise<any[]> {
        return this.loadFromDB();
    }

    // Temporary: Flashcards/Terminology need DB schema support.
    // For now, we return empty or implement a separate DB table later.
    public getFlashcards(): any[] {
        return [];
    }

    public getTerminology(): any {
        return {};
    }

    public static async getAll(): Promise<Subject[]> {
        const db = await DatabaseService.getInstance();
        const res = db.query("SELECT * FROM subject");
        return res.map(r => new Subject(r.id, r.name, r.subject_api_uri));
    }
}
