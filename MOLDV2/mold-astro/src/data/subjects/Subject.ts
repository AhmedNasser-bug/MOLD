
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// ==========================================
// 1. SCHEMAS (Data Contracts)
// ==========================================

export const QuestionTypeSchema = z.enum(['mcq', 'multi', 'tf']);

const BaseQuestionSchema = z.object({
    id: z.string().optional(),
    type: QuestionTypeSchema,
    question: z.string(),
    explanation: z.string(),
    category: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    relatedTerms: z.array(z.string()).optional(),
    sourceChunkId: z.string().optional(),
});

export const MCQQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('mcq'),
    options: z.array(z.string()).min(2),
    correct: z.number().int().min(0),
});

export const MultiQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('multi'),
    options: z.array(z.string()).min(2),
    correct: z.array(z.number().int().min(0)),
});

export const TFQuestionSchema = BaseQuestionSchema.extend({
    type: z.literal('tf'),
    correct: z.boolean(),
});

export const QuestionSchema = z.discriminatedUnion('type', [
    MCQQuestionSchema,
    MultiQuestionSchema,
    TFQuestionSchema
]);

export const FlashcardSchema = z.array(z.object({
    front: z.string(),
    back: z.string(),
    type: z.enum(['term', 'question'])
}));

// TypeScript Derived Types
export type Question = z.infer<typeof QuestionSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>[number];

// ==========================================
// 2. GAME MODES (Configuration & Prompts)
// ==========================================

export interface GameModeConfig {
    id: string;
    label: string;
    description: string;
    icon: string;
    componentId: 'QuizScreen' | 'FlashcardScreen';
    schema: z.ZodType<any>;
    promptStrategy: (context: string) => string;
}

export const SUBJECT_MODES: Record<string, GameModeConfig> = {
    speedrun: {
        id: 'speedrun',
        label: 'Speedrun',
        description: 'All 120 questions, timed challenge',
        icon: '⚡',
        componentId: 'QuizScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `
            GOAL: Generate educational questions covering the breadth of the material.
            STRATEGY: Focus on flow. Mix easy and medium difficulty.
            CONTEXT: ${context}
        `
    },
    blitz: {
        id: 'blitz',
        label: 'Blitz',
        description: '30 random questions, fast-paced',
        icon: '🎯',
        componentId: 'QuizScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `
            GOAL: Generate fast-paced recall questions.
            STRATEGY: Short questions, unambiguous answers. Focus on definitions and core facts.
            CONTEXT: ${context}
        `
    },
    hardcore: {
        id: 'hardcore',
        label: 'Hardcore',
        description: 'Deep analysis & application',
        icon: '🔥',
        componentId: 'QuizScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `
            GOAL: Generate difficult questions acting as a Senior Auditor.
            STRATEGY: Edge cases, complex scenarios, multi-select vulnerability identification.
            CONTEXT: ${context}
        `
    },
    practice: {
        id: 'practice',
        label: 'Practice',
        description: 'By category, no pressure',
        icon: '📚',
        componentId: 'QuizScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `
            GOAL: Generate pedagogical questions for practice.
            STRATEGY: Detailed explanations are priority. Group by sub-topic.
            CONTEXT: ${context}
        `
    },
    'flashcards-term': {
        id: 'flashcards-term',
        label: 'Terminology',
        description: 'Memorize key terms',
        icon: '🃏',
        componentId: 'FlashcardScreen',
        schema: FlashcardSchema,
        promptStrategy: (context) => `
            GOAL: Extract terminology flashcards.
            STRATEGY: Front is the term, Back is the definition + analogy. Set type to 'term'.
            CONTEXT: ${context}
        `
    },
    'flashcards-bank': {
        id: 'flashcards-bank',
        label: 'Question Bank',
        description: 'High-impact Q&A',
        icon: '🧠',
        componentId: 'FlashcardScreen',
        schema: FlashcardSchema,
        promptStrategy: (context) => `
            GOAL: Create Q&A flashcards for interview prep.
            STRATEGY: Front is the question, Back is the concise text answer. Set type to 'question'.
            CONTEXT: ${context}
        `
    }
};

// ==========================================
// 3. SUBJECT DATA MODEL (The "Class")
// ==========================================

export interface SubjectData {
    id: string;
    config: {
        title: string;
        description: string;
    };
    questions: Question[];
    flashcards: Flashcard[];
    // Dynamic access for other generated content if needed
    [key: string]: any;
}

// ==========================================
// 4. LOADER LOGIC (Runtime)
// ==========================================

export class Subject {

    /**
     * Loads a full subject by ID, aggregating all generated content.
     */
    static async load(subjectId: string): Promise<SubjectData | null> {
        try {
            // In a real build, we might need a different path strategy or import.meta.glob
            // For now, replicating the dynamic glob logic from the old loader.

            const metas = import.meta.glob('../../data/subjects/*/meta.json');
            let metaPath = `../../data/subjects/${subjectId}/meta.json`;

            // Check if exists in glob
            if (!metas[metaPath]) {
                // Try finding by ID match if path structure is different
                const found = Object.keys(metas).find(k => k.includes(`/${subjectId}/`));
                if (found) metaPath = found;
                else return null;
            }

            const metaMod: any = await metas[metaPath]();
            const config = metaMod.default.config;

            // Load Content
            const jsonFiles = import.meta.glob('../../data/subjects/**/*.json', { eager: true });
            let questions: Question[] = [];
            let flashcards: Flashcard[] = [];

            const subjectDir = path.dirname(metaPath); // e.g. ../../data/subjects/blockchain

            for (const filePath in jsonFiles) {
                // Must be in the same directory
                // Basic string check since path.dirname might vary across OS/Vite
                if (!filePath.includes(`/${subjectId}/`)) continue;

                const fileName = filePath.split('/').pop() || '';
                const content = (jsonFiles[filePath] as any).default;

                if (Array.isArray(content)) {
                    if (fileName.startsWith('questions')) {
                        questions = questions.concat(content);
                    } else if (fileName.startsWith('flashcards')) {
                        flashcards = flashcards.concat(content);
                    }
                }
            }

            return {
                id: subjectId,
                config,
                questions,
                flashcards
            };

        } catch (error) {
            console.error(`Failed to load subject ${subjectId}`, error);
            return null;
        }
    }

    /**
     * Returns a list of all available subjects (for the Index page).
     */
    static async listAll(): Promise<SubjectData[]> {
        const metas = import.meta.glob('../../data/subjects/*/meta.json');
        const subjects: SubjectData[] = [];

        for (const metaPath in metas) {
            try {
                // Extract ID from path: ../../data/subjects/blockchain/meta.json -> blockchain
                const parts = metaPath.split('/');
                const id = parts[parts.length - 2];
                const subj = await this.load(id);
                if (subj) subjects.push(subj);
            } catch (e) {
                console.error(`Error listing subject ${metaPath}`, e);
            }
        }
        return subjects;
    }
}
