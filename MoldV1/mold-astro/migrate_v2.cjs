
const fs = require('fs');
const path = require('path');

// Paths
const legacyDataPath = path.join(__dirname, '..', '..', 'StaticV1', 'js', 'data.js');
const outputDir = path.join(__dirname, 'src', 'data', 'subjects', 'blockchain');

console.log(`Reading legacy data from: ${legacyDataPath}`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read the legacy file
try {
    const fileContent = fs.readFileSync(legacyDataPath, 'utf8');

    // Quick and dirty manual parsing because the file is a JS file with a const _SUBJECT_DATA
    // We'll strip the assignment and parse the Object
    let jsonContent = fileContent.replace('const _SUBJECT_DATA =', '').trim();
    // Remove trailing semicolon if present
    if (jsonContent.endsWith(';')) {
        jsonContent = jsonContent.slice(0, -1);
    }

    // Evaluate safely? No, let's just use Function constructor to get the object if JSON.parse fails
    // The original file might have unquoted keys or comments.
    // Let's rely on node require if we can module.exports it?
    // Or just eval it.

    // Better idea: Create a temp file that exports it
    const tempFile = path.join(__dirname, 'temp_loader.cjs');
    fs.writeFileSync(tempFile, fileContent + '\nmodule.exports = _SUBJECT_DATA;');

    const data = require(tempFile);
    console.log("Data loaded successfully.");

    // 1. Meta (Subject & Config)
    const meta = {
        config: data.config,
        categories: data.categories || data.subject.categories || [],
        ...data.subject
    };
    // Remove bulky arrays from meta
    delete meta.questions;
    delete meta.achievements;
    delete meta.terminology;
    delete meta.flashcards; // if exists

    fs.writeFileSync(path.join(outputDir, 'meta.json'), JSON.stringify(meta, null, 2));
    console.log("Created meta.json");

    // 2. Questions
    // questions might be at root or subject
    const rawQuestions = data.questions || data.subject.questions || [];
    const questions = rawQuestions.map((q, i) => ({
        id: `q_${i}`,
        ...q
    }));
    fs.writeFileSync(path.join(outputDir, 'questions.json'), JSON.stringify(questions, null, 2));
    console.log(`Created questions.json with ${questions.length} items.`);

    // 3. Achievements
    const achievements = data.achievements || data.subject.achievements || [];
    fs.writeFileSync(path.join(outputDir, 'achievements.json'), JSON.stringify(achievements, null, 2));
    console.log(`Created achievements.json with ${achievements.length} items.`);

    // 4. Terminology
    const terminology = data.terminology || data.subject.terminology || {};
    fs.writeFileSync(path.join(outputDir, 'terminology.json'), JSON.stringify(terminology, null, 2));
    console.log(`Created terminology.json with ${Object.keys(terminology).length} items.`);

    // Cleanup
    fs.unlinkSync(tempFile);
    console.log("Migration Complete.");

} catch (err) {
    console.error("Migration failed:", err);
}
