// @ts-check
import { defineConfig } from 'astro/config';

// Use Vercel adapter for Vercel deployment
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    base: "/",
    output: "server",
    adapter: vercel(),
    build: {
        format: "file",
    },
    vite: {
        optimizeDeps: {
            exclude: ['@sqlite.org/sqlite-wasm'],
        },
        server: {
            headers: {
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
            },
        },
    },
});
