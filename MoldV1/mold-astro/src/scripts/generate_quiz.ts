
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Generator } from '../ai/pipeline/Generator';
import { GeminiAdapter } from '../ai/GeminiAdapter';

// Load environment variables
dotenv.config();

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error('Usage: ts-node src/scripts/generate_quiz.ts <subject_name> <input_file> <mode>');
        console.error('Example: ts-node src/scripts/generate_quiz.ts blockchain ./blockchain_whitepaper.txt speedrun');
        process.exit(1);
    }

    const [subjectId, inputFile, modeId] = args;

    // Resolve input path
    const inputPath = path.resolve(process.cwd(), inputFile);
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ Input file not found: ${inputPath}`);
        process.exit(1);
    }

    console.log(`\n📂 Reading input: ${inputPath}`);
    const rawText = fs.readFileSync(inputPath, 'utf-8');

    // Adapter Strategy: Choose Gemini
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) console.warn('⚠️ GEMINI_API_KEY missing. Using MOCK.');

    // Dependency Injection
    const adapter = new GeminiAdapter({ apiKey });
    const generator = new Generator(adapter, { maxRetries: 3 });

    console.time('Generation Duration');
    try {
        const questions = await generator.generate(subjectId, rawText, modeId);

        if (questions.length === 0) {
            console.warn('⚠️ No questions generated.');
        } else {
            // Save to file
            const outputDir = path.resolve(process.cwd(), 'src/data/subjects/json');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

            const outputPath = path.join(outputDir, `${subjectId}_${modeId}_generated.json`);
            fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
            console.log(`\n✅ Success! Generated ${questions.length} questions.`);
            console.log(`💾 Saved to: ${outputPath}`);
        }

    } catch (e) {
        console.error('❌ Generation Failed:', e);
    }
    console.timeEnd('Generation Duration');
}

main().catch(console.error);
