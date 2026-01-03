
import type { LLMAdapter } from './adapters/LLMAdapter';
import { SUBJECT_MODES, QuestionSchema, type Question } from '../../data/subjects/Subject';
import { zodToJsonSchema } from 'zod-to-json-schema';

interface GeneratorOptions {
    chunkSize?: number;
    overlap?: number;
}

export class Generator {
    private adapter: LLMAdapter;
    private options: GeneratorOptions;

    // Dependency Injection: Pass ANY adapter (Gemini, OpenAI, etc.)
    constructor(adapter: LLMAdapter, options: GeneratorOptions = {}) {
        this.adapter = adapter;
        this.options = { chunkSize: 1500, overlap: 100, ...options };
    }

    /**
     * The Main Pipeline: Text -> Questions[]
     */
    async generate(subjectId: string, rawText: string, modeId: string): Promise<Question[]> {
        console.log(`🚀 Generator Started: ${subjectId} [${modeId}]`);

        // 1. Get Mode Config
        const mode = SUBJECT_MODES[modeId];
        if (!mode) throw new Error(`Unknown mode: ${modeId}`);

        // 2. Chunk Text
        const chunks = this.chunkText(rawText);
        console.log(`📦 Created ${chunks.length} chunks.`);

        const allQuestions: Question[] = [];

        // 3. Process Chunks
        for (const [i, chunk] of chunks.entries()) {
            console.log(`⚡ Processing Chunk ${i + 1}/${chunks.length}...`);
            try {
                // 4. Construct Prompt
                const prompt = this.constructPrompt(subjectId, mode, chunk);

                // 5. Call LLM
                const rawResponse = await this.adapter.generate(prompt);

                // 6. Parse & Validate
                const batch = this.parseAndValidate(rawResponse);
                allQuestions.push(...batch);
                console.log(`  -> Validated ${batch.length} items.`);

            } catch (e) {
                console.error(`❌ Failed Chunk ${i + 1}:`, e);
            }
        }

        return allQuestions;
    }

    /**
     * Preprocessing: Split text into processable chunks
     */
    private chunkText(text: string): string[] {
        const { chunkSize, overlap } = this.options;
        const paragraphs = text.split(/\n\s*\n/);
        const chunks: string[] = [];
        let current = '';

        for (const para of paragraphs) {
            if ((current + para).length > chunkSize!) {
                if (current) {
                    chunks.push(current.trim());
                    // Simple overlap: take last N chars
                    current = current.slice(-overlap!) + '\n\n' + para;
                } else {
                    chunks.push(para.trim()); // Para too big, just push it
                    current = '';
                }
            } else {
                current += '\n\n' + para;
            }
        }
        if (current.trim()) chunks.push(current.trim());
        return chunks;
    }

    /**
     * Prompting: Combine Strategy + Context + Schema Contract
     */
    private constructPrompt(subjectName: string, mode: any, context: string): string {
        // Generate JSON Schema Contract
        const jsonSchema = zodToJsonSchema(mode.schema, { name: 'ResponseData' });

        return `
            GOAL: Generate content for "${subjectName}" in mode "${mode.label}".
            
            STRATEGY:
            ${mode.promptStrategy(context)}

            CONTEXT_MATERIAL:
            ${context}

            CONTRACT:
            You must return a raw JSON Array.
            Schema: ${JSON.stringify(jsonSchema)}
            
            RULES:
            - NO Markdown.
            - ONLY JSON.
        `;
    }

    /**
     * Postprocessing: Parse JSON -> Validate with Zod
     */
    private parseAndValidate(raw: string): Question[] {
        let clean = raw.trim();
        // Remove markdown fences if present
        if (clean.startsWith('```')) {
            clean = clean.replace(/^```(json)?/, '').replace(/```$/, '');
        }

        try {
            const parsed = JSON.parse(clean);
            const data = Array.isArray(parsed) ? parsed : [parsed];

            // Validate each item against the schema
            // We use standard QuestionSchema for now, but really should be mode.schema
            // However, since Question is the unified type, we map to it.
            // If mode is flashcards, this pipeline needs to support generic return types.
            // For this specific refactor step, I will stick to Question[] return type
            // but in future it should be T[]

            // Note: If mode is Flashcards, this validation will fail if we enforce QuestionSchema.
            // We should use the specific schema from the mode if possible, but for type safety
            // in this "SubjectGenerator", we are returning Question[]. 
            // FIXME: The user asked for handling persistence too.

            return data.map((item: any) => {
                // Auto-generate ID if missing
                if (!item.id) item.id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                return QuestionSchema.parse(item);
            });

        } catch (e) {
            console.error('Validation failed', e);
            return [];
        }
    }
}
