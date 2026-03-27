import fs from 'node:fs/promises';
import path from 'node:path';
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params }) => {
  const subjectId = params.id;
  const dataPath = path.resolve(`./src/data/subjects/${subjectId}/questions.json`);
  try {
    await fs.access(dataPath);
    const fileContent = await fs.readFile(dataPath, "utf-8");
    return new Response(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.error(`Failed to load questions for ${subjectId}:`, e);
    return new Response(JSON.stringify({ error: "Subject data not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
