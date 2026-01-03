import { QuestionSchema, type Question } from '../data/subjects/Subject';

/**
 * Factory for creating typed Question objects from raw AI output.
 * Uses Zod schemas to enforce the AI->UI contract at runtime.
 */
export class QuestionFactory {
    private static idCounter = 0;

    /**
     * Parse and validate raw data against the QuestionSchema.
     * Throws a ZodError if the data does not match the contract.
     */
    static create(data: any, sourceChunkId?: string): Question {
        // 1. Initial ID and mapping
        const rawWithId = {
            id: `q_${++this.idCounter}_${Date.now()}`,
            sourceChunkId,
            ...data
        };

        // 2. Validate against schema
        // This handles type discrimination (mcq vs tf), option counts, indices types, etc.
        try {
            return QuestionSchema.parse(rawWithId);
        } catch (error) {
            console.error('Schema Validation Failed for Question:', data);
            throw error;
        }
    }

    /**
     * Batch create questions from an array of raw data.
     */
    static createBatch(dataArray: any[], sourceChunkId?: string): Question[] {
        return dataArray.map(data => this.create(data, sourceChunkId));
    }
}
