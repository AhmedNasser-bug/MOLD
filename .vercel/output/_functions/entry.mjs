import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_B0uXv3er.mjs';
import { manifest } from './manifest_CevjW1lb.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/subjects/_id_/questions.astro.mjs');
const _page2 = () => import('./pages/api/subjects/_id_.astro.mjs');
const _page3 = () => import('./pages/_subject_.astro.mjs');
const _page4 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.17.2_@netlify+blobs@10.7.0_@types+node@25.2.3_@vercel+functions@2.2.13_jiti@2.6_a75029aa9a0aa3ec273a965cc1a3eb9b/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/subjects/[id]/questions.ts", _page1],
    ["src/pages/api/subjects/[id]/index.ts", _page2],
    ["src/pages/[subject]/index.astro", _page3],
    ["src/pages/index.astro", _page4]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "4178ac00-b848-4754-bfe4-9249d5a4eaf6",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
