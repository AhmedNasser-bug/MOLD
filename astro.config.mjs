// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
    base: "/",
    output: "server",
    adapter: netlify(),
    build: {
        format: "file",
    },
});
