import test from 'node:test';
import assert from 'node:assert';
import { escapeHtml } from '../ui/scripts/utils.ts';

test('escapeHtml sanitizes html tags correctly', () => {
    assert.strictEqual(escapeHtml('<script>alert("xss")</script>'), '&#x3C;script&#x3E;alert(&#x22;xss&#x22;)&#x3C;/script&#x3E;');
    assert.strictEqual(escapeHtml('<strong>Answer:</strong>'), '&#x3C;strong&#x3E;Answer:&#x3C;/strong&#x3E;');
    assert.strictEqual(escapeHtml('Normal text'), 'Normal text');
});
