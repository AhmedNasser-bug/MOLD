import { zodToJsonSchema } from 'zod-to-json-schema';
import { SUBJECT_MODES, QuestionSchema } from '../data/subjects/Subject';

/**
 * PromptTemplate Registry
 * Centralizes AI instructions and enforces Schema-Driven Prompting.
 */

export class PromptTemplate {

    /**
     * Generates a "Contract" prompt for the LLM based on our Zod Schema.
     * This ensures the AI always knows exactly what structure to return.
     */
    static getQuestionGenerationContract(): string {
        const jsonSchema = zodToJsonSchema(QuestionSchema, {
            name: 'QuestionSet',
            nameStrategy: 'title',
        });

        return `
            TARGET_INTERFACE_CONTRACT:
            You must return a JSON array of objects. 
            Each object MUST strictly adhere to the following JSON Schema:
            
            ${JSON.stringify(jsonSchema, null, 2)}
            
            STRICT_RULES:
            1. No markdown formatting in the response (no \`\`\`json).
            2. Return ONLY the raw JSON string.
            3. Ensure "correct" indices are valid relative to the "options" array.
            4. "explanation" should be pedagogical and encouraging.
        `;
    }

    /**
     * High-level template for specific generation tasks.
     * Dynamically pulls strategy from SUBJECT_MODES.
     */
    static createSubjectQuizPrompt(subject: string, mode: string, context: string): string {
        const contract = this.getQuestionGenerationContract();

        // Dynamic Strategy Lookup
        // @ts-ignore
        const modeConfig = SUBJECT_MODES[mode];

        if (!modeConfig) {
            console.warn(`Unknown mode: ${mode}, defaulting to generic.`);
            // Recursive fallback to practice
            if (mode !== 'practice') {
                return this.createSubjectQuizPrompt(subject, 'practice', context);
            }
        }

        const strategy = modeConfig.promptStrategy(context);

        return `
            ${strategy}
            
            ${contract}
            
            CRITICAL_INSTRUCTIONS:
            - Stick strictly to the JSON schema.
            - Ensure questions map to the provided categories if possible.
        `;
    }
}
