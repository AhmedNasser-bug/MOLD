/**
 * Validator (Stub)
 * Postprocessing: Validates generated questions using schemas.
 */
import type { Question } from '../interfaces/Question';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export class Validator {
    /**
     * Validate a single question.
     */
    validate(question: Question): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // STUB: Implement Zod schema validation

        // Basic structural validation
        if (!question.id) errors.push('Missing question ID');
        if (!question.question) errors.push('Missing question text');
        if (!question.explanation) warnings.push('Missing explanation');
        if (!question.category) warnings.push('Missing category');

        // Type-specific validation
        if (question.type === 'mcq' || question.type === 'multi') {
            if (!question.options || question.options.length < 2) {
                errors.push('MCQ/Multi must have at least 2 options');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate a batch of questions.
     */
    validateBatch(questions: Question[]): { valid: Question[]; invalid: Array<{ question: Question; result: ValidationResult }> } {
        const valid: Question[] = [];
        const invalid: Array<{ question: Question; result: ValidationResult }> = [];

        for (const q of questions) {
            const result = this.validate(q);
            if (result.valid) {
                valid.push(q);
            } else {
                invalid.push({ question: q, result });
            }
        }

        return { valid, invalid };
    }
}
