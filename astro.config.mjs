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
            entries: ['src/pages/**/*.astro'], // Only scan pages, not all 38+ components
        },
        server: {
            headers: {
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp',
            },
            hmr: {
                overlay: true,
                timeout: 30000, // Increase timeout for SQLite WASM initialization
            },
        },
        ssr: {
            noExternal: ['@sqlite.org/sqlite-wasm'], // Bundle SQLite in SSR to prevent loading issues
        },
    },
});
