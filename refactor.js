import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function findAstroFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findAstroFiles(fullPath, fileList);
        } else if (fullPath.endsWith('.astro') || fullPath.endsWith('.ts')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const files = findAstroFiles(srcDir);
let changedFiles = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Exception for the store itself
    if (file.includes('SubjectState.ts')) continue;

    if (content.includes('window.subjectData')) {
        // Calculate relative path to SubjectState
        const subjectStatePath = path.join(srcDir, 'logic', 'state', 'SubjectState');
        let relativePath = path.relative(path.dirname(file), subjectStatePath).replace(/\\/g, '/');
        if (!relativePath.startsWith('.')) relativePath = './' + relativePath;

        const importStmt = `import { subjectState } from "${relativePath}";\n`;

        // Don't auto-patch Subject.ts directly if it's too complex, I'll do it manually
        if (file.includes('Subject.ts')) {
            continue;
        }

        if (file.includes('Mold.astro')) {
            // Replace `window.subjectData = subject` with `subjectState.setSubject(subject);`
            content = content.replace(/window\.subjectData\s*=\s*(.*?);/g, 'subjectState.setSubject($1);');
        }

        // Replace window.subjectData read
        content = content.replace(/window\.subjectData/g, 'subjectState.getSubject()');

        // Insert import statement safely inside <script>
        if (file.endsWith('.astro')) {
            if (content.includes('<script>') && !content.includes('import { subjectState }')) {
                content = content.replace(/<script>/, `<script>\n    ${importStmt}`);
            }
        } else if (file.endsWith('.ts')) {
            if (!content.includes('import { subjectState }')) {
                content = importStmt + content;
            }
        }

        if (content !== original) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated: ${file}`);
            changedFiles++;
        }
    }
}

console.log(`Refactored ${changedFiles} files.`);
