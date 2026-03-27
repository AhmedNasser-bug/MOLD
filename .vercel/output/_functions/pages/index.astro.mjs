import { e as createComponent, l as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_CdAb-tOC.mjs';
import { S as Subject, $ as $$Layout } from '../chunks/Subject_B8ajgkCr.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const subjects = await Subject.listAll();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mold V1 | Subject Selector" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="screen active" style="padding-top: 50px;"> <div class="header"> <h1>🧠 Mold V1</h1> <p>Select a verified subject to begin your mastery.</p> </div> <div class="container"> <div class="category-grid"> ${subjects.map((subject) => renderTemplate`<a${addAttribute(`/${subject.id}`, "href")} class="category-card" style="text-decoration:none; display:block"> <h3>${subject.name.toUpperCase()}</h3> <p>${subject.config.description}</p> <div style="margin-top:10px; font-size:0.8rem; color:var(--text-muted)"> ${subject.questions.length} Questions • ${Object.keys(subject.terminology).length} Terms
</div> </a>`)} </div> ${subjects.length === 0 && renderTemplate`<div style="text-align:center; padding: 40px; color: var(--text-muted)"> <p>No subjects found. Run the generation script to create one!</p> </div>`} </div> </div> ` })}`;
}, "/app/src/pages/index.astro", void 0);

const $$file = "/app/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
