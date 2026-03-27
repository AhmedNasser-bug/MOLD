
import { z } from 'zod';


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
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
    relatedTerms: z.array(z.string()).optional(),
    sourceChunkId: z.string().optional(),
    isHtml: z.boolean().optional(),
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

export const TerminologyItemSchema = z.object({
    Category: z.string(),
    Meaning: z.string(),
    Where_it_is_used: z.string().optional(),
    When_it_is_used: z.string().optional(),
    Analogy: z.string().optional(),
    Pros: z.array(z.string()).optional(),
    Cons: z.array(z.string()).optional(),
});

export const TerminologySchema = z.record(z.string(), TerminologyItemSchema);

// TypeScript Derived Types
export type Question = z.infer<typeof QuestionSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>[number];
export type TerminologyItem = z.infer<typeof TerminologyItemSchema>;
export type Terminology = z.infer<typeof TerminologySchema>;

// Meta Schema
export const SubjectMetaSchema = z.object({
    subject: z.object({
        id: z.string(),
        name: z.string()
    }),
    config: z.object({
        title: z.string(),
        description: z.string(),
        themeColor: z.string().optional(),
        version: z.string().optional(),
        storageKey: z.string().optional()
    })
});
export type SubjectMeta = z.infer<typeof SubjectMetaSchema>;

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
        description: 'Time Attack: Complete all questions.',
        icon: '⚡',
        componentId: 'SpeedrunScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `...`
    },
    blitz: {
        id: 'blitz',
        label: 'Blitz',
        description: 'Random subset for quick review.',
        icon: '🎯',
        componentId: 'BlitzScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `...`
    },
    hardcore: {
        id: 'hardcore',
        label: 'Hardcore',
        description: 'Deep analysis & application',
        icon: '🔥',
        componentId: 'HardcoreScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `...`
    },
    survival: {
        id: 'survival',
        label: 'Survival',
        description: 'Time decreases as you gain XP.',
        icon: '☠️',
        componentId: 'SurvivalScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `...`
    },
    practice: {
        id: 'practice',
        label: 'Practice',
        description: 'By category, no pressure',
        icon: '📚',
        componentId: 'PracticeScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `...`
    },
    'flashcards-term': {
        id: 'flashcards-term',
        label: 'Terminology',
        description: 'Memorize key terms',
        icon: '🃏',
        componentId: 'FlashcardScreen',
        schema: FlashcardSchema,
        promptStrategy: (context) => `...`
    },
    'flashcards-bank': {
        id: 'flashcards-bank',
        label: 'Question Bank',
        description: 'High-impact Q&A',
        icon: '🧠',
        componentId: 'FlashcardScreen',
        schema: FlashcardSchema,
        promptStrategy: (context) => `...`
    },
    'full-revision': {
        id: 'full-revision',
        label: 'Full Revision',
        description: 'Strict order: Questions then Terminology. 100% Mastery.',
        icon: '🎓',
        componentId: 'ExamScreen',
        schema: z.array(QuestionSchema),
        promptStrategy: (context) => `...`
    }
};


// ==========================================
// 3. SUBJECT DATA MODEL (The "Class")
// ==========================================

export interface SubjectData {
    id: string;
    name: string; // Add name explicitly
    config: {
        title: string;
        description: string;
        themeColor?: string;
        version?: string;
        storageKey?: string;
    };
    questions: Question[];
    flashcards: Flashcard[];
    terminology: Terminology;
    achievements: any[];
    [key: string]: any;
}

// ==========================================
// 4. LOADER LOGIC (Runtime)
// ==========================================

export class Subject {

    /**
     * Loads a full subject by ID from public/data using FS (SSR/Build time).
     */
    static async load(subjectId: string): Promise<SubjectData | null> {
        try {
            const fs = await import('node:fs/promises');
            const path = await import('node:path');

            // Resolve public directory
            const publicDir = path.join(process.cwd(), 'public');
            const subjectsDir = path.join(publicDir, 'data', 'subjects');

            // Handle case sensitivity/spaces by finding matching directory
            // This mirrors client logic but on server fs
            let targetDir = path.join(subjectsDir, subjectId);

            try {
                await fs.access(targetDir);
            } catch {
                // If exact match fails, try case-insensitive search
                const dirs = await fs.readdir(subjectsDir);
                const match = dirs.find(d => d.toLowerCase() === subjectId.toLowerCase() || d === decodeURIComponent(subjectId));
                if (match) {
                    targetDir = path.join(subjectsDir, match);
                } else {
                    console.error(`Subject directory not found for: ${subjectId}`);
                    return null;
                }
            }

            // Load Meta
            const metaPath = path.join(targetDir, 'meta.json');
            const metaContent = await fs.readFile(metaPath, 'utf-8');
            const metaJson = JSON.parse(metaContent);

            const config = metaJson.config;
            const subjectMeta = metaJson.subject || {};
            const name = subjectMeta.name || config.title || subjectId;

            // Load Content Files
            let questions: Question[] = [];
            let flashcards: Flashcard[] = [];
            let terminology: Terminology = {};
            let achievements: any[] = [];

            // Helper to safe load JSON
            const safeLoad = async (filename: string): Promise<any> => {
                try {
                    const p = path.join(targetDir, filename);
                    const c = await fs.readFile(p, 'utf-8');
                    return JSON.parse(c);
                } catch {
                    return null;
                }
            };

            const qData = await safeLoad('questions.json');
            if (Array.isArray(qData)) questions = qData;

            const fData = await safeLoad('flashcards.json');
            if (Array.isArray(fData)) flashcards = fData;

            const tData = await safeLoad('terminology.json');
            if (tData) terminology = tData;

            const aData = await safeLoad('achievements.json');
            if (Array.isArray(aData)) achievements = aData;

            return {
                id: subjectId, // Keep original requested ID or directory name? Using requested ID helps with URL matching.
                name,
                config,
                questions,
                flashcards,
                terminology,
                achievements
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
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        const subjects: SubjectData[] = [];

        try {
            const publicDir = path.join(process.cwd(), 'public');
            const subjectsDir = path.join(publicDir, 'data', 'subjects');

            const dirs = await fs.readdir(subjectsDir, { withFileTypes: true });

            for (const dirent of dirs) {
                if (dirent.isDirectory()) {
                    const subj = await this.load(dirent.name);
                    if (subj) subjects.push(subj);
                }
            }
        } catch (e) {
            console.error(`Error listing subjects`, e);
        }
        return subjects;
    }
}
