
import { Chunker } from '../preprocessing/Chunker';
import { PromptTemplate } from './PromptTemplate';
import { QuestionFactory } from './QuestionFactory';
import { GeminiAdapter } from './GeminiAdapter';
import type { SubjectData, Question } from '../data/subjects/Subject';
import type { MaterialChunk } from '../interfaces/Material';

export class GenerationPipeline {
    private adapter: GeminiAdapter;
    private chunker: Chunker;

    constructor() {
        // Requires GEMINI_API_KEY in env
        this.adapter = new GeminiAdapter({ apiKey: process.env.GEMINI_API_KEY || '' });
        this.chunker = new Chunker({ chunkSize: 1500 });
    }

    /**
     * Run the full pipeline for a specific subject and mode.
     */
    async run(subjectName: string, rawText: string, mode: string): Promise<Question[]> {
        console.log(`🚀 Starting Pipeline: ${subjectName} [${mode}]`);

        // 1. Chunking
        console.log('📦 Chunking text...');
        const chunks = this.chunker.chunk(rawText, subjectName);
        console.log(`✅ Generated ${chunks.length} chunks.`);

        const allQuestions: Question[] = [];

        // 2. Processing Loop
        for (const [index, chunk] of chunks.entries()) {
            console.log(`Processing Chunk ${index + 1}/${chunks.length}...`);

            try {
                // 3. Prompt Generation
                const prompt = PromptTemplate.createSubjectQuizPrompt(
                    subjectName,
                    mode,
                    chunk.text
                );

                // 4. LLM Generation
                const rawResponse = await this.adapter.generate(prompt);

                // 5. Validation & Parsing
                // The adapter should return a JSON string, possibly wrapped in markdown
                let jsonStr = rawResponse;
                // Basic cleanup if LLM ignores instruction 'no markdown'
                if (jsonStr.includes('```json')) {
                    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                } else if (jsonStr.includes('```')) {
                    jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
                }

                let parsed;
                try {
                    parsed = JSON.parse(jsonStr);
                } catch (e) {
                    console.error('Failed to parse JSON:', jsonStr.substring(0, 100) + '...');
                    continue; // Skip chunk on bad JSON
                }

                if (!Array.isArray(parsed)) {
                    console.warn('Expected array, got object. Wrapping...');
                    parsed = [parsed];
                }

                // 6. Factory Validation (Zod)
                const questions = QuestionFactory.createBatch(parsed, chunk.id);
                allQuestions.push(...questions);
                console.log(`  -> Generated ${questions.length} questions.`);

            } catch (error) {
                console.error(`❌ Error processing chunk ${index}:`, error);
            }
        }

        console.log(`✨ Pipeline Complete. Total Questions: ${allQuestions.length}`);
        return allQuestions;
    }
}
