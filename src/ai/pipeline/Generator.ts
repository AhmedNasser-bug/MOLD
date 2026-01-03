
import type { LLMAdapter } from '../LLMAdapter';
import { SUBJECT_MODES, type Question } from '../../data/subjects/Subject';
import { Validator } from './Validator';
import { zodToJsonSchema } from 'zod-to-json-schema';

interface GeneratorOptions {
    chunkSize?: number;
    overlap?: number;
    maxRetries?: number;
}

export class Generator {
    private adapter: LLMAdapter;
    private options: GeneratorOptions;

    constructor(adapter: LLMAdapter, options: GeneratorOptions = {}) {
        this.adapter = adapter;
        this.options = {
            chunkSize: 1500,
            overlap: 100,
            maxRetries: 3,
            ...options
        };
    }

    async generate(subjectId: string, rawText: string, modeId: string): Promise<Question[]> {
        console.log(`🚀 Generator Started: ${subjectId} [${modeId}]`);

        const mode = SUBJECT_MODES[modeId];
        if (!mode) throw new Error(`Unknown mode: ${modeId}`);

        const chunks = this.chunkText(rawText);
        console.log(`📦 Created ${chunks.length} chunks.`);

        const allQuestions: Question[] = [];

        for (const [i, chunk] of chunks.entries()) {
            console.log(`⚡ Processing Chunk ${i + 1}/${chunks.length}...`);
            const questions = await this.processChunkWithRetry(subjectId, mode, chunk);
            allQuestions.push(...questions);
        }

        return allQuestions;
    }

    private async processChunkWithRetry(subjectId: string, mode: any, chunk: string): Promise<Question[]> {
        let attempts = 0;
        let lastError: any;

        while (attempts < this.options.maxRetries!) {
            try {
                attempts++;
                const prompt = this.constructPrompt(subjectId, mode, chunk);
                const response = await this.adapter.generate(prompt);
                const batch = Validator.validate(response.content);

                console.log(`  -> Validated ${batch.length} items (Attempt ${attempts})`);
                return batch;

            } catch (e) {
                console.warn(`  ⚠️ Attempt ${attempts} failed:`, e instanceof Error ? e.message : e);
                lastError = e;
                // Optional: Wait nicely between retries
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        console.error(`❌ Failed Chunk after ${attempts} attempts.`);
        return []; // Return empty on failure to ensure partial results for other chunks
    }

    private chunkText(text: string): string[] {
        const { chunkSize, overlap } = this.options;
        const paragraphs = text.split(/\n\s*\n/);
        const chunks: string[] = [];
        let current = '';

        for (const para of paragraphs) {
            if ((current + para).length > chunkSize!) {
                if (current) {
                    chunks.push(current.trim());
                    current = current.slice(-overlap!) + '\n\n' + para;
                } else {
                    chunks.push(para.trim());
                    current = '';
                }
            } else {
                current += '\n\n' + para;
            }
        }
        if (current.trim()) chunks.push(current.trim());
        return chunks;
    }

    private constructPrompt(subjectName: string, mode: any, context: string): string {
        const jsonSchema = zodToJsonSchema(mode.schema, { name: 'ResponseData' });
        return `
            GOAL: Generate content for "${subjectName}" in mode "${mode.label}".
            STRATEGY: ${mode.promptStrategy(context)}
            CONTEXT_MATERIAL: ${context}
            CONTRACT: Return a raw JSON Array.
            Schema: ${JSON.stringify(jsonSchema)}
            RULES: NO Markdown. ONLY JSON.
        `;
    }
}
