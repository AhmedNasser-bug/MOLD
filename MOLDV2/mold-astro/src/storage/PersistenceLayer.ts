/**
 * Persistence Layer Interface
 * Abstracts storage backends (File, DB, VectorStore).
 */
import type { QuestionSet } from '../interfaces/QuestionSet';
import type { Material } from '../interfaces/Material';

export type StorageBackend = 'file' | 'database' | 'vectorstore';

/**
 * Interface for persistence operations.
 */
export interface PersistenceLayer {
    readonly backend: StorageBackend;

    // Question Set Operations
    saveQuestionSet(set: QuestionSet): Promise<string>;
    getQuestionSet(id: string): Promise<QuestionSet | null>;
    listQuestionSets(): Promise<QuestionSet[]>;
    deleteQuestionSet(id: string): Promise<boolean>;

    // Material Operations
    saveMaterial(material: Material): Promise<string>;
    getMaterial(id: string): Promise<Material | null>;
    listMaterials(): Promise<Material[]>;
    deleteMaterial(id: string): Promise<boolean>;

    // Search Operations (for VectorStore)
    search?(query: string, limit?: number): Promise<Array<{ id: string; score: number }>>;
}

/**
 * File-based persistence (Stub)
 */
export class FilePersistence implements PersistenceLayer {
    readonly backend: StorageBackend = 'file';
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    async saveQuestionSet(set: QuestionSet): Promise<string> {
        // STUB: Write to JSON file
        throw new Error('FilePersistence.saveQuestionSet() not implemented');
    }

    async getQuestionSet(id: string): Promise<QuestionSet | null> {
        // STUB: Read from JSON file
        throw new Error('FilePersistence.getQuestionSet() not implemented');
    }

    async listQuestionSets(): Promise<QuestionSet[]> {
        // STUB: List JSON files
        throw new Error('FilePersistence.listQuestionSets() not implemented');
    }

    async deleteQuestionSet(id: string): Promise<boolean> {
        // STUB: Delete JSON file
        throw new Error('FilePersistence.deleteQuestionSet() not implemented');
    }

    async saveMaterial(material: Material): Promise<string> {
        throw new Error('FilePersistence.saveMaterial() not implemented');
    }

    async getMaterial(id: string): Promise<Material | null> {
        throw new Error('FilePersistence.getMaterial() not implemented');
    }

    async listMaterials(): Promise<Material[]> {
        throw new Error('FilePersistence.listMaterials() not implemented');
    }

    async deleteMaterial(id: string): Promise<boolean> {
        throw new Error('FilePersistence.deleteMaterial() not implemented');
    }
}
