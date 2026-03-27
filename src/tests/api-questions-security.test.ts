import test from 'node:test';
import assert from 'node:assert';
import { GET } from '../pages/api/subjects/[id]/questions.ts';
import type { APIContext } from 'astro';

test('Security tests for subject questions API endpoint', async (t) => {

    await t.test('Valid alphanumeric id should pass validation', async () => {
        const mockContext = {
            params: { id: 'math-101' }
        } as unknown as APIContext;

        const response = await GET(mockContext);
        // Should return 404 because file doesn't exist, NOT 400 validation error
        assert.strictEqual(response.status, 404);

        const data = await response.json();
        assert.strictEqual(data.error, "Subject data not found");
    });

    await t.test('Missing id should return 400', async () => {
        const mockContext = {
            params: {}
        } as unknown as APIContext;

        const response = await GET(mockContext);
        assert.strictEqual(response.status, 400);

        const data = await response.json();
        assert.strictEqual(data.error, "Invalid subject ID");
    });

    await t.test('Path traversal with dots and slashes should return 400', async () => {
        const mockContext = {
            params: { id: '../secret-data' }
        } as unknown as APIContext;

        const response = await GET(mockContext);
        assert.strictEqual(response.status, 400);

        const data = await response.json();
        assert.strictEqual(data.error, "Invalid subject ID format");
    });

    await t.test('Path traversal with encoded slashes should return 400', async () => {
        const mockContext = {
            params: { id: '..%2f..%2fetc%2fpasswd' }
        } as unknown as APIContext;

        const response = await GET(mockContext);
        assert.strictEqual(response.status, 400);

        const data = await response.json();
        assert.strictEqual(data.error, "Invalid subject ID format");
    });

    await t.test('Null bytes should return 400', async () => {
        const mockContext = {
            params: { id: 'math\0' }
        } as unknown as APIContext;

        const response = await GET(mockContext);
        assert.strictEqual(response.status, 400);

        const data = await response.json();
        assert.strictEqual(data.error, "Invalid subject ID format");
    });
});
