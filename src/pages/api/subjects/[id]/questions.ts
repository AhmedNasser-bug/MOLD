
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

// GET /api/subjects/[id]/questions
export const GET: APIRoute = async ({ params }) => {
    const subjectId = params.id;

    if (!subjectId || typeof subjectId !== 'string') {
        return new Response(JSON.stringify({ error: "Invalid subject ID" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Validate subjectId to prevent path traversal (only allow alphanumeric, dashes, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(subjectId)) {
        return new Response(JSON.stringify({ error: "Invalid subject ID format" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // In a real app, we might check a registry. 
    // Here we map ID to the data folder structure convention.
    // Assuming structure: src/data/subjects/[id]/questions.json
    // Or src/data/[id]/questions.json. Let's assume src/data/subjects/[id].
    // Wait, let's verify where 'questions.json' usually lives.
    // Based on previous knowledge, it might be directly in src/data or src/data/subjects.
    // I will use a robust lookup or just assume a standard path for now.

    const baseDir = path.resolve('./src/data/subjects');
    // Defaulting to: src/data/subjects/[id]/questions.json
    const dataPath = path.resolve(baseDir, subjectId, 'questions.json');

    // Defense-in-depth: Ensure the resolved path is within the base directory
    if (!dataPath.startsWith(baseDir)) {
        return new Response(JSON.stringify({ error: "Invalid path" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Verify file exists
        await fs.access(dataPath);

        const fileContent = await fs.readFile(dataPath, 'utf-8');
        return new Response(fileContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (e) {
        // Fallback: Try looking in src/data/[id].json if strictly folder-based
        console.error(`Failed to load questions for ${subjectId}:`, e);
        return new Response(JSON.stringify({ error: "Subject data not found" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
