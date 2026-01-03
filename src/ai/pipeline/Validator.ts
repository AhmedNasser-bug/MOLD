
import { QuestionSchema, type Question } from '../../data/subjects/Subject';

export class Validator {
    /**
     * Parses and validates the raw LLM response.
     * Extracts JSON from potential markdown fences.
     * Validates against QuestionSchema.
     */
    static validate(raw: string): Question[] {
        let clean = raw.trim();
        // Remove markdown fences
        if (clean.startsWith('```')) {
            clean = clean.replace(/^```(json)?/, '').replace(/```$/, '');
        }

        let parsed: any;
        try {
            parsed = JSON.parse(clean);
        } catch (e) {
            throw new Error(`JSON Parse Failed: ${e instanceof Error ? e.message : String(e)}`);
        }

        const data = Array.isArray(parsed) ? parsed : [parsed];

        return data.map((item: any, index: number) => {
            // Auto-generate ID if missing
            if (!item.id) item.id = `gen_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`;

            try {
                return QuestionSchema.parse(item);
            } catch (zodError) {
                throw new Error(`Validation Error at item ${index}: ${zodError}`);
            }
        });
    }
}
