/**
 * Deduplicator (Stub)
 * Postprocessing: Removes duplicate or similar questions.
 */
import type { Question } from '../interfaces/Question';

export interface DeduplicationResult {
    unique: Question[];
    duplicates: Array<{ question: Question; similarTo: string }>;
}

export class Deduplicator {
    private similarityThreshold: number;

    constructor(similarityThreshold: number = 0.85) {
        this.similarityThreshold = similarityThreshold;
    }

    /**
     * Remove duplicate questions from a set.
     */
    deduplicate(questions: Question[]): DeduplicationResult {
        // STUB: Implement similarity detection (Levenshtein, cosine similarity, etc.)
        const unique: Question[] = [];
        const duplicates: Array<{ question: Question; similarTo: string }> = [];

        const seen = new Set<string>();

        for (const q of questions) {
            const normalizedText = this.normalize(q.question);

            if (seen.has(normalizedText)) {
                duplicates.push({ question: q, similarTo: normalizedText });
            } else {
                seen.add(normalizedText);
                unique.push(q);
            }
        }

        return { unique, duplicates };
    }

    /**
     * Normalize text for comparison.
     */
    private normalize(text: string): string {
        return text.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    }

    /**
     * Calculate similarity between two strings (stub).
     */
    private calculateSimilarity(a: string, b: string): number {
        // STUB: Implement actual similarity calculation
        return a === b ? 1.0 : 0.0;
    }
}
