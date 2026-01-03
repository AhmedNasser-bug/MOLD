
const fs = require('fs');
const path = require('path');

// Read the raw file
const dataPath = path.join(__dirname, 'js/data.js');
const rawContent = fs.readFileSync(dataPath, 'utf8');

// Quick and dirty eval to get the object (since it's a simple assignment)
// specific removal of "const _SUBJECT_DATA = " and optional trailing semicolon
const jsonContent = rawContent.replace('const _SUBJECT_DATA =', '').trim().replace(/;$/, '');
let subjectData;
try {
    // using Function instead of eval for slight safety, though it's local code
    subjectData = new Function('return ' + jsonContent)();
} catch (e) {
    console.error("Failed to parse data.js", e);
    process.exit(1);
}

const targetDir = path.join(__dirname, '../mold-astro/src/data/subjects/blockchain');

// Ensure dir exists (redundant if I ran mkdir, but good practice)
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Meta (config + subject info)
const meta = {
    config: subjectData.config,
    subject: subjectData.subject
};
fs.writeFileSync(path.join(targetDir, 'meta.json'), JSON.stringify(meta, null, 2));
console.log('Written meta.json');

// 2. Questions
fs.writeFileSync(path.join(targetDir, 'questions.json'), JSON.stringify(subjectData.questions || [], null, 2));
console.log('Written questions.json');

// 3. Achievements
fs.writeFileSync(path.join(targetDir, 'achievements.json'), JSON.stringify(subjectData.achievements || [], null, 2));
console.log('Written achievements.json');

// 4. Terminology
fs.writeFileSync(path.join(targetDir, 'terminology.json'), JSON.stringify(subjectData.terminology || {}, null, 2));
console.log('Written terminology.json');
