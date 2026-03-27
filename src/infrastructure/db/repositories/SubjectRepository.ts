
import { DatabaseService } from "../DatabaseService";
import { TransactionManager } from "../TransactionManager";

export class SubjectRepository {
    private static instance: SubjectRepository;

    private constructor() { }

    public static getInstance(): SubjectRepository {
        if (!SubjectRepository.instance) {
            SubjectRepository.instance = new SubjectRepository();
        }
        return SubjectRepository.instance;
    }

    public async getDB() {
        return await DatabaseService.getInstance();
    }

    public async exists(id: string): Promise<boolean> {
        const db = await this.getDB();
        // Case-insensitive check
        const res = db.query("SELECT id FROM subject WHERE LOWER(id) = LOWER(?)", [id]);
        return res.length > 0;
    }

    public async saveFullSubject(
        id: string,
        name: string,
        apiUri: string,
        questions: any[],
        terminology: any[] = [],
        flashcards: any[] = []
    ): Promise<void> {
        const db = await this.getDB();
        
        await TransactionManager.execute(db, async (tx) => {
            // 1. Subject Metadata + Content Blobs
            await tx.run(
                "INSERT OR REPLACE INTO subject (id, name, subject_api_uri, terminology, flashcards) VALUES (?, ?, ?, ?, ?)",
                [
                    id,
                    name,
                    apiUri,
                    JSON.stringify(terminology),
                    JSON.stringify(flashcards)
                ]
            );

            // 2. Questions (batch insert for better performance)
            const chunkSize = 50;
            for (let i = 0; i < questions.length; i += chunkSize) {
                const chunk = questions.slice(i, i + chunkSize);
                const placeholders = chunk.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
                const params = chunk.flatMap(q => [
                    q.id,
                    id,
                    q.category,
                    q.type,
                    q.question,
                    JSON.stringify(q.options || []),
                    JSON.stringify(q.correct),
                    q.explanation || ""
                ]);
                await tx.run(
                    `INSERT OR REPLACE INTO question (id, subject_id, category, type, question, options, correct, explanation) VALUES ${placeholders}`,
                    params
                );
            }
        });
    }

    public async saveSubjectMetadata(id: string, name: string, apiUri: string): Promise<void> {
        const db = await this.getDB();
        db.run(
            "INSERT OR REPLACE INTO subject (id, name, subject_api_uri) VALUES (?, ?, ?)",
            [id, name, apiUri]
        );
    }

    public async saveQuestions(subjectId: string, questions: any[]): Promise<void> {
        const db = await this.getDB();
        await TransactionManager.execute(db, async (tx) => {
            const chunkSize = 50;
            for (let i = 0; i < questions.length; i += chunkSize) {
                const chunk = questions.slice(i, i + chunkSize);
                const placeholders = chunk.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
                const params = chunk.flatMap(q => [
                    q.id,
                    subjectId,
                    q.category,
                    q.type,
                    q.question,
                    JSON.stringify(q.options || []),
                    JSON.stringify(q.correct),
                    q.explanation || ""
                ]);
                await tx.run(
                    `INSERT OR REPLACE INTO question (id, subject_id, category, type, question, options, correct, explanation) VALUES ${placeholders}`,
                    params
                );
            }
        });
    }

    public async getSubjectData(id: string): Promise<any | null> {
        const db = await this.getDB();
        const rows = db.query("SELECT * FROM subject WHERE LOWER(id) = LOWER(?)", [id]);
        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            id: row.id,
            name: row.name,
            subjectApiUri: row.subject_api_uri,
            terminology: row.terminology ? JSON.parse(row.terminology) : [],
            flashcards: row.flashcards ? JSON.parse(row.flashcards) : []
        };
    }

    public async getQuestionsForSubject(subjectId: string): Promise<any[]> {
        const db = await this.getDB();
        // Case insensitive join/select
        const rows = db.query("SELECT * FROM question WHERE LOWER(subject_id) = LOWER(?)", [subjectId]);
        return rows.map(r => ({
            id: r.id,
            category: r.category,
            type: r.type,
            question: r.question,
            options: r.options ? JSON.parse(r.options) : undefined,
            correct: r.correct ? JSON.parse(r.correct) : undefined,
            explanation: r.explanation
        }));
    }

    public async getAllSubjects(): Promise<any[]> {
        const db = await this.getDB();
        return db.query("SELECT * FROM subject");
    }
}
