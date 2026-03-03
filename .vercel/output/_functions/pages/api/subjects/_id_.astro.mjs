import fs from 'node:fs/promises';
import path from 'node:path';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params, request }) => {
  const subjectId = params.id;
  if (!subjectId) {
    return new Response(JSON.stringify({ error: "No subject ID provided" }), { status: 400 });
  }
  const publicDir = path.join(process.cwd(), "public");
  const subjectsDir = path.join(publicDir, "data", "subjects");
  let targetDir = path.join(subjectsDir, subjectId);
  console.log(`[API] Request for Subject ID: "${subjectId}"`);
  console.log(`[API] Checking exact path: ${targetDir}`);
  try {
    await fs.access(targetDir);
    console.log(`[API] Exact match found.`);
  } catch {
    console.log(`[API] Exact match failed. Trying fallback search in ${subjectsDir}`);
    try {
      const dirs = await fs.readdir(subjectsDir);
      console.log(`[API] Available directories: ${dirs.join(", ")}`);
      const match = dirs.find(
        (d) => d.toLowerCase() === subjectId.toLowerCase() || d === decodeURIComponent(subjectId)
      );
      if (match) {
        console.log(`[API] Fuzzy match found: ${match}`);
        targetDir = path.join(subjectsDir, match);
      } else {
        console.error(`[API] No match found for "${subjectId}"`);
        return new Response(JSON.stringify({ error: "Subject directory not found" }), { status: 404 });
      }
    } catch (e) {
      console.error("Error reading subject directory:", e);
      return new Response(JSON.stringify({ error: "Server error reading subjects" }), { status: 500 });
    }
  }
  const safeLoad = async (filename) => {
    try {
      const p = path.join(targetDir, filename);
      const content = await fs.readFile(p, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  };
  try {
    const [metaData, questions, flashcards, terminology, achievements] = await Promise.all([
      safeLoad("meta.json"),
      safeLoad("questions.json"),
      safeLoad("flashcards.json"),
      safeLoad("terminology.json"),
      safeLoad("achievements.json")
    ]);
    const responseData = {
      id: subjectId,
      meta: metaData || {},
      questions: Array.isArray(questions) ? questions : [],
      flashcards: Array.isArray(flashcards) ? flashcards : [],
      terminology: terminology || {},
      achievements: Array.isArray(achievements) ? achievements : []
    };
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error(`Failed to aggregate data for ${subjectId}`, e);
    return new Response(JSON.stringify({ error: "Failed to load subject data" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
