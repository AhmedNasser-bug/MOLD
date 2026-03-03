import { e as createComponent, g as addAttribute, o as renderHead, p as renderSlot, r as renderTemplate, h as createAstro } from './astro/server_CdAb-tOC.mjs';
/* empty css                         */
import { z } from 'zod';

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description, themeColor = "#131313" } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description"${addAttribute(description, "content")}><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>"><meta name="theme-color"${addAttribute(themeColor, "content")}><meta name="generator"${addAttribute(Astro2.generator, "content")}><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0"><title>${title}</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/app/src/layouts/Layout.astro", void 0);

const QuestionTypeSchema = z.enum(["mcq", "multi", "tf"]);
const BaseQuestionSchema = z.object({
  id: z.string().optional(),
  type: QuestionTypeSchema,
  question: z.string(),
  explanation: z.string(),
  category: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  relatedTerms: z.array(z.string()).optional(),
  sourceChunkId: z.string().optional(),
  isHtml: z.boolean().optional()
});
const MCQQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("mcq"),
  options: z.array(z.string()).min(2),
  correct: z.number().int().min(0)
});
const MultiQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("multi"),
  options: z.array(z.string()).min(2),
  correct: z.array(z.number().int().min(0))
});
const TFQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("tf"),
  correct: z.boolean()
});
const QuestionSchema = z.discriminatedUnion("type", [
  MCQQuestionSchema,
  MultiQuestionSchema,
  TFQuestionSchema
]);
z.array(z.object({
  front: z.string(),
  back: z.string(),
  type: z.enum(["term", "question"])
}));
const TerminologyItemSchema = z.object({
  Category: z.string(),
  Meaning: z.string(),
  Where_it_is_used: z.string().optional(),
  When_it_is_used: z.string().optional(),
  Analogy: z.string().optional(),
  Pros: z.array(z.string()).optional(),
  Cons: z.array(z.string()).optional()
});
z.record(z.string(), TerminologyItemSchema);
z.object({
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
({
  speedrun: {
    schema: z.array(QuestionSchema)},
  blitz: {
    schema: z.array(QuestionSchema)},
  hardcore: {
    schema: z.array(QuestionSchema)},
  survival: {
    schema: z.array(QuestionSchema)},
  practice: {
    schema: z.array(QuestionSchema)},
  "full-revision": {
    schema: z.array(QuestionSchema)}
});
class Subject {
  /**
   * Loads a full subject by ID from public/data using FS (SSR/Build time).
   */
  static async load(subjectId) {
    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const publicDir = path.join(process.cwd(), "public");
      const subjectsDir = path.join(publicDir, "data", "subjects");
      let targetDir = path.join(subjectsDir, subjectId);
      try {
        await fs.access(targetDir);
      } catch {
        const dirs = await fs.readdir(subjectsDir);
        const match = dirs.find((d) => d.toLowerCase() === subjectId.toLowerCase() || d === decodeURIComponent(subjectId));
        if (match) {
          targetDir = path.join(subjectsDir, match);
        } else {
          console.error(`Subject directory not found for: ${subjectId}`);
          return null;
        }
      }
      const metaPath = path.join(targetDir, "meta.json");
      const metaContent = await fs.readFile(metaPath, "utf-8");
      const metaJson = JSON.parse(metaContent);
      const config = metaJson.config;
      const subjectMeta = metaJson.subject || {};
      const name = subjectMeta.name || config.title || subjectId;
      let questions = [];
      let flashcards = [];
      let terminology = {};
      let achievements = [];
      const safeLoad = async (filename) => {
        try {
          const p = path.join(targetDir, filename);
          const c = await fs.readFile(p, "utf-8");
          return JSON.parse(c);
        } catch {
          return null;
        }
      };
      const qData = await safeLoad("questions.json");
      if (Array.isArray(qData)) questions = qData;
      const fData = await safeLoad("flashcards.json");
      if (Array.isArray(fData)) flashcards = fData;
      const tData = await safeLoad("terminology.json");
      if (tData) terminology = tData;
      const aData = await safeLoad("achievements.json");
      if (Array.isArray(aData)) achievements = aData;
      return {
        id: subjectId,
        // Keep original requested ID or directory name? Using requested ID helps with URL matching.
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
  static async listAll() {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const subjects = [];
    try {
      const publicDir = path.join(process.cwd(), "public");
      const subjectsDir = path.join(publicDir, "data", "subjects");
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

export { $$Layout as $, Subject as S };
