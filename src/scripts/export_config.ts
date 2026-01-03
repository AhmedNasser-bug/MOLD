
import fs from 'fs';
import path from 'path';
import { SUBJECT_MODES } from '../data/subjects/Subject.ts';
import { zodToJsonSchema } from 'zod-to-json-schema';

const OUTPUT_DIR = path.resolve(process.cwd(), 'dist');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'n8n_config.json');

function exportConfig() {
    console.log('🚀 Starting Configuration Export for n8n...');

    const exportData: Record<string, any> = {
        generatedAt: new Date().toISOString(),
        modes: {}
    };

    for (const [modeId, mode] of Object.entries(SUBJECT_MODES)) {
        console.log(`   Processing mode: ${modeId}`);

        // 1. Convert Zod Schema to JSON Schema
        const jsonSchema = zodToJsonSchema(mode.schema, { name: 'ResponseData' });

        // 2. Convert Prompt Strategy to Template String
        // We inject a placeholder to turn the function into a template
        const placeholder = '{{context}}';
        const promptTemplate = mode.promptStrategy(placeholder);

        exportData.modes[modeId] = {
            id: mode.id,
            label: mode.label,
            description: mode.description,
            promptTemplate: promptTemplate,
            jsonSchema: jsonSchema
        };
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(exportData, null, 2));
    console.log(`✅ Export Complete! Config saved to: ${OUTPUT_FILE}`);
}

exportConfig();
