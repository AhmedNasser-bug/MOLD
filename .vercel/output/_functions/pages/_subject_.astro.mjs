import { e as createComponent, m as maybeRenderHead, k as renderScript, r as renderTemplate, l as renderComponent, h as createAstro, n as defineScriptVars, g as addAttribute } from '../chunks/astro/server_CdAb-tOC.mjs';
import { S as Subject, $ as $$Layout } from '../chunks/Subject_B8ajgkCr.mjs';
/* empty css                                 */
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$SetupPanel = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="setup-panel card" style="max-width: 800px; margin: 0 auto; width: 100%;"> <h3>CONFIGURATION</h3> <div class="control-row"> <label class="toggle-switch"> <input type="checkbox" id="setupSurvivalToggle"> <span class="slider"></span> <span class="label">SURVIVAL MDOE (1-LIFE)</span> </label> </div> <div class="control-row"> <label class="toggle-switch"> <input type="checkbox" id="setupTimeToggle"> <span class="slider"></span> <span class="label">TIME LIMIT</span> </label> <input type="number" id="setupTimeInput" class="time-input" value="300" min="60" disabled> </div> </div> ${renderScript($$result, "/app/src/ui/components/modules/SetupPanel.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/modules/SetupPanel.astro", void 0);

const $$ModeSelector = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="mode-selector-grid"> <!-- Row 1: Challenges --> <button class="mode-card" data-mode="speedrun"> <div class="mode-icon">⚡</div> <div class="mode-info"> <h3>SPEEDRUN</h3> <p>Time Attack: Complete all questions.</p> </div> </button> <button class="mode-card" data-mode="blitz"> <div class="mode-icon">🎯</div> <div class="mode-info"> <h3>BLITZ</h3> <p>Random subset for quick review.</p> </div> </button> <button class="mode-card" data-mode="hardcore"> <div class="mode-icon">🔥</div> <div class="mode-info"> <h3>HARDCORE</h3> <p>Deep analysis & application</p> </div> </button> <!-- Row 2: Practice & Study --> <button class="mode-card highlight-border" data-mode="practice"> <div class="mode-icon">🗂️</div> <div class="mode-info"> <h3>PRACTICE</h3> <p>By category, no pressure</p> </div> </button> <button class="mode-card" data-mode="terminology"> <div class="mode-icon">🃏</div> <div class="mode-info"> <h3>TERMINOLOGY</h3> <p>Memorize key terms</p> </div> </button> <button class="mode-card" data-mode="question-bank"> <div class="mode-icon">🧠</div> <div class="mode-info"> <h3>QUESTION BANK</h3> <p>High-impact Q&A</p> </div> </button> <button class="mode-card" data-mode="full-revision"> <div class="mode-icon">🎓</div> <div class="mode-info"> <h3>FULL REVISION</h3> <p>Strict order: Questions then Terminology. 100% Mastery.</p> </div> </button> </div> ${renderScript($$result, "/app/src/ui/components/modules/ModeSelector.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/modules/ModeSelector.astro", void 0);

const $$OperationLogs = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="operation-logs-container"> <div class="logs-header"> <h3>SYSTEM LOGS</h3> <div class="status-indicator online"></div> </div> <div class="logs-content" id="logContent"> <div class="log-entry"><span class="timestamp">[INIT]</span> System initialized...</div> <div class="log-entry"><span class="timestamp">[DB]</span> SQLite WASM loaded.</div> <div class="log-entry"><span class="timestamp">[NET]</span> API Endpoint: /api/subjects available.</div> <!-- More dynamic logs could be appended via JS --> </div> </div> ${renderScript($$result, "/app/src/ui/components/modules/OperationLogs.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/modules/OperationLogs.astro", void 0);

const $$Astro$c = createAstro();
const $$HomeScreen = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$HomeScreen;
  const { subjectName, description } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="screen active" id="homeScreen"> <div style="max-width: 1200px; margin: 0 auto; padding: 40px;"> <div class="header"> <h1 class="hero-title">${subjectName.toUpperCase()}</h1> <div class="hero-subtitle-container"> <div class="separator-line"></div> <p class="subtitle-text">MASTERY PROTOCOL V2</p> </div> <p class="description-text">${description}</p> </div>  ${renderComponent($$result, "SetupPanel", $$SetupPanel, {})} <div class="card selector-container"> <h2 class="section-title">SELECT OPERATIONAL MODE</h2>  ${renderComponent($$result, "ModeSelector", $$ModeSelector, { "onSelect": ((mode) => console.log("Mode selected", mode)) })} <div id="categorySelector" class="category-selector-container"> <h3 class="category-selector-title">TARGET SECTOR</h3> <div class="category-grid" id="categoryGrid"></div> </div> <div class="start-btn-group"> <button class="btn btn-secondary encyclopedia-btn" id="revisionBtn">
📖 ENCYCLOPEDIA (REF)
</button> <button class="btn btn-primary start-challenge-btn" onclick="window.game.startQuiz()">
INITIALIZE CHALLENGE
</button> </div> </div> <div class="card history-card"> <div class="history-header"> <h2>OPERATION LOGS</h2> </div> ${renderComponent($$result, "OperationLogs", $$OperationLogs, {})} </div> </div> </div> <!-- Settings Panel Overlay --> ${renderScript($$result, "/app/src/ui/screens/HomeScreen.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/screens/HomeScreen.astro", void 0);

var __freeze$2 = Object.freeze;
var __defProp$2 = Object.defineProperty;
var __template$2 = (cooked, raw) => __freeze$2(__defProp$2(cooked, "raw", { value: __freeze$2(raw || cooked.slice()) }));
var _a$2;
const $$Astro$b = createAstro();
const $$Stopwatch = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Stopwatch;
  const { id, initialTime = 0, onTimeUp, autoStart = false } = Astro2.props;
  return renderTemplate(_a$2 || (_a$2 = __template$2(["", '<div class="stopwatch-container"', '> <div class="stopwatch-icon">\u23F1\uFE0F</div> <div class="stopwatch-time"', ">00:00</div> </div> <script>(function(){", "\n    class StopwatchController {\n        constructor(rootId) {\n            this.el = document.getElementById(rootId);\n            if (!this.el) return;\n            \n            this.display = this.el.querySelector('.stopwatch-time');\n            this.remaining = 0;\n            this.interval = null;\n            this.onTimeUpHandler = null;\n\n            // Expose instance\n            this.el.stopwatchInstance = this;\n        }\n\n        setTime(seconds) {\n            this.remaining = seconds;\n            this.updateDisplay();\n        }\n\n        start(duration, onComplete) {\n            this.mode = (duration && duration > 0) ? 'countdown' : 'elapsed';\n            \n            if (this.mode === 'countdown') {\n                this.remaining = duration;\n            } else {\n                this.elapsed = 0; // Usage for count-up\n                this.remaining = 0; // display uses remaining variable name? let's split.\n            }\n            \n            if (onComplete) this.onTimeUpHandler = onComplete;\n\n            if(this.interval) clearInterval(this.interval);\n\n            this.updateDisplay();\n            this.el.classList.remove('stopwatch-warning', 'stopwatch-critical');\n\n            this.interval = window.setInterval(() => {\n                if (this.mode === 'countdown') {\n                    this.remaining--;\n                    this.updateDisplay(this.remaining);\n\n                    // Visual Feedback\n                    if(this.remaining <= 10 && this.remaining > 5) {\n                        this.el.classList.add('stopwatch-warning');\n                    } else if (this.remaining <= 5) {\n                        this.el.classList.remove('stopwatch-warning');\n                        this.el.classList.add('stopwatch-critical');\n                    }\n\n                    if (this.remaining <= 0) {\n                        this.stop();\n                        this.updateDisplay(0);\n                        this.el.dispatchEvent(new CustomEvent('time-up', { bubbles: true }));\n                        if (this.onTimeUpHandler) this.onTimeUpHandler();\n                    }\n                } else {\n                    // Elapsed Mode\n                    this.elapsed = (this.elapsed || 0) + 1;\n                    this.updateDisplay(this.elapsed);\n                }\n            }, 1000);\n        }\n\n        stop() {\n            if (this.interval) {\n                clearInterval(this.interval);\n                this.interval = null;\n            }\n            this.el.classList.remove('stopwatch-warning', 'stopwatch-critical');\n        }\n\n        updateDisplay(seconds) {\n            // Default to remaining if seconds argument missing (legacy call safety)\n            const val = (seconds !== undefined) ? seconds : (this.mode === 'countdown' ? this.remaining : this.elapsed);\n            const m = Math.floor(val / 60);\n            const s = val % 60;\n            this.display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;\n        }\n\n        stop() {\n            if (this.interval) {\n                clearInterval(this.interval);\n                this.interval = null;\n            }\n            this.el.classList.remove('stopwatch-warning', 'stopwatch-critical');\n        }\n\n        updateDisplay() {\n            const m = Math.floor(this.remaining / 60);\n            const s = this.remaining % 60;\n            this.display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;\n        }\n    }\n\n    // Instantiate specifically for this component's ID\n    new StopwatchController(id);\n})();<\/script>"], ["", '<div class="stopwatch-container"', '> <div class="stopwatch-icon">\u23F1\uFE0F</div> <div class="stopwatch-time"', ">00:00</div> </div> <script>(function(){", "\n    class StopwatchController {\n        constructor(rootId) {\n            this.el = document.getElementById(rootId);\n            if (!this.el) return;\n            \n            this.display = this.el.querySelector('.stopwatch-time');\n            this.remaining = 0;\n            this.interval = null;\n            this.onTimeUpHandler = null;\n\n            // Expose instance\n            this.el.stopwatchInstance = this;\n        }\n\n        setTime(seconds) {\n            this.remaining = seconds;\n            this.updateDisplay();\n        }\n\n        start(duration, onComplete) {\n            this.mode = (duration && duration > 0) ? 'countdown' : 'elapsed';\n            \n            if (this.mode === 'countdown') {\n                this.remaining = duration;\n            } else {\n                this.elapsed = 0; // Usage for count-up\n                this.remaining = 0; // display uses remaining variable name? let's split.\n            }\n            \n            if (onComplete) this.onTimeUpHandler = onComplete;\n\n            if(this.interval) clearInterval(this.interval);\n\n            this.updateDisplay();\n            this.el.classList.remove('stopwatch-warning', 'stopwatch-critical');\n\n            this.interval = window.setInterval(() => {\n                if (this.mode === 'countdown') {\n                    this.remaining--;\n                    this.updateDisplay(this.remaining);\n\n                    // Visual Feedback\n                    if(this.remaining <= 10 && this.remaining > 5) {\n                        this.el.classList.add('stopwatch-warning');\n                    } else if (this.remaining <= 5) {\n                        this.el.classList.remove('stopwatch-warning');\n                        this.el.classList.add('stopwatch-critical');\n                    }\n\n                    if (this.remaining <= 0) {\n                        this.stop();\n                        this.updateDisplay(0);\n                        this.el.dispatchEvent(new CustomEvent('time-up', { bubbles: true }));\n                        if (this.onTimeUpHandler) this.onTimeUpHandler();\n                    }\n                } else {\n                    // Elapsed Mode\n                    this.elapsed = (this.elapsed || 0) + 1;\n                    this.updateDisplay(this.elapsed);\n                }\n            }, 1000);\n        }\n\n        stop() {\n            if (this.interval) {\n                clearInterval(this.interval);\n                this.interval = null;\n            }\n            this.el.classList.remove('stopwatch-warning', 'stopwatch-critical');\n        }\n\n        updateDisplay(seconds) {\n            // Default to remaining if seconds argument missing (legacy call safety)\n            const val = (seconds !== undefined) ? seconds : (this.mode === 'countdown' ? this.remaining : this.elapsed);\n            const m = Math.floor(val / 60);\n            const s = val % 60;\n            this.display.textContent = \\`\\${m.toString().padStart(2, '0')}:\\${s.toString().padStart(2, '0')}\\`;\n        }\n\n        stop() {\n            if (this.interval) {\n                clearInterval(this.interval);\n                this.interval = null;\n            }\n            this.el.classList.remove('stopwatch-warning', 'stopwatch-critical');\n        }\n\n        updateDisplay() {\n            const m = Math.floor(this.remaining / 60);\n            const s = this.remaining % 60;\n            this.display.textContent = \\`\\${m.toString().padStart(2, '0')}:\\${s.toString().padStart(2, '0')}\\`;\n        }\n    }\n\n    // Instantiate specifically for this component's ID\n    new StopwatchController(id);\n})();<\/script>"])), maybeRenderHead(), addAttribute(id || "stopwatch-root", "id"), addAttribute(`${id || "sw"}-display`, "id"), defineScriptVars({ id: id || "stopwatch-root" }));
}, "/app/src/ui/components/Stopwatch.astro", void 0);

const $$Astro$a = createAstro();
const $$BackButton = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$BackButton;
  const { label = "EXIT TO MENU", onClick = "window.game.goHome()" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<button class="back-btn"${addAttribute(onClick, "onclick")}> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"></path> </svg> ${label} </button>`;
}, "/app/src/ui/components/BackButton.astro", void 0);

const $$Astro$9 = createAstro();
const $$GameHeader = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$GameHeader;
  const { mode, id = "game-header" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`game-header-wrapper ${mode}`, "class")}${addAttribute(id, "id")}> <div class="gh-left"> ${renderComponent($$result, "BackButton", $$BackButton, {})} </div> <!-- Center: Stopwatch or Title? --> <div class="gh-center"> <!-- We use Stopwatch always, Logic decides if it counts Up or Down --> ${renderComponent($$result, "Stopwatch", $$Stopwatch, { "id": `${id}-stopwatch` })} </div> <div class="gh-right"> <div class="gh-score-box"> <span class="gh-label">SCORE</span> <span class="gh-value"${addAttribute(`${id}-score`, "id")}>0</span> </div> </div> </div> ${renderScript($$result, "/app/src/ui/components/GameHeader.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/GameHeader.astro", void 0);

const $$Astro$8 = createAstro();
const $$QuestionDisplay = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$QuestionDisplay;
  const { id = "questionDisplay" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="question-display-root"${addAttribute(id, "id")} data-astro-cid-nm744jca> <div class="q-header-meta" data-astro-cid-nm744jca> <span class="category-badge" id="qdCategory" data-astro-cid-nm744jca>Category</span> <!-- Difficulty could go here --> </div> <div class="q-text-area" id="qdText" data-astro-cid-nm744jca>
Loading Question...
</div> <!-- Container for dynamic card injection --> <div class="q-card-area" id="qdCardArea" data-astro-cid-nm744jca> <!-- Dynmaically mounted cards go here --> </div> <div class="q-feedback-area hidden" id="qdFeedback" data-astro-cid-nm744jca> <div class="feedback-content" id="qdExplanation" data-astro-cid-nm744jca></div> </div> </div>  ${renderScript($$result, "/app/src/ui/components/QuestionDisplay.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/QuestionDisplay.astro", void 0);

const $$Astro$7 = createAstro();
const $$VerticalStressBar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$VerticalStressBar;
  const { duration = 60 } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="stress-bar-component"> <div class="stress-bar-container" id="stressBar"> <div class="stress-icon">⚡</div> <div class="stress-fill" id="stressFill" style="height: 100%;"></div> <div class="stress-value" id="stressText">${duration}</div> </div> </div> ${renderScript($$result, "/app/src/ui/components/VerticalStressBar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/VerticalStressBar.astro", void 0);

const $$Astro$6 = createAstro();
const $$QuestionContainer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$QuestionContainer;
  const { id = "question-container", enableStressBar = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="question-container-root"${addAttribute(id, "id")}> <!-- Optional: Local Stress Bar for Survival Mode --> <div class="qc-stress-bar-wrapper hidden"> ${renderComponent($$result, "VerticalStressBar", $$VerticalStressBar, { "duration": 15 })} </div> <!-- The actual Question Renderer --> <div class="qc-display-wrapper"> ${renderComponent($$result, "QuestionDisplay", $$QuestionDisplay, { "id": `${id}-display` })} </div> </div> ${renderScript($$result, "/app/src/ui/components/gameplay/QuestionContainer.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/gameplay/QuestionContainer.astro", void 0);

const $$Astro$5 = createAstro();
const $$GameFooter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$GameFooter;
  const { id = "game-footer" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="game-footer-root"${addAttribute(id, "id")}> <div class="gf-left"> <button class="btn btn-secondary footer-btn"${addAttribute(`${id}-hint`, "id")}> <span>💡</span> Hint
</button> <button class="btn btn-danger footer-btn"${addAttribute(`${id}-skip`, "id")}> <span>⏩</span> Skip
</button> </div> <div class="gf-right"> <button class="btn btn-primary footer-btn"${addAttribute(`${id}-submit`, "id")} disabled>
Submit
</button> <button class="btn btn-primary footer-btn hidden"${addAttribute(`${id}-next`, "id")}>
Next <span>➜</span> </button> </div> </div> ${renderScript($$result, "/app/src/ui/components/GameFooter.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/GameFooter.astro", void 0);

const $$Astro$4 = createAstro();
const $$HintPopup = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$HintPopup;
  const { id = "hintPopup" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(id, "id")} class="hint-overlay hidden" role="dialog" aria-modal="true"${addAttribute(`${id}-title`, "aria-labelledby")} data-astro-cid-3amnq2io> <div class="hint-card" data-astro-cid-3amnq2io> <div class="hint-header" data-astro-cid-3amnq2io> <span class="hint-icon" data-astro-cid-3amnq2io>💡</span> <h3${addAttribute(`${id}-title`, "id")} data-astro-cid-3amnq2io>HINT</h3> <button class="hint-close"${addAttribute(`${id}-close`, "id")} aria-label="Close hint" data-astro-cid-3amnq2io>&times;</button> </div> <div class="hint-body" data-astro-cid-3amnq2io> <p${addAttribute(`${id}-text`, "id")} class="hint-text" data-astro-cid-3amnq2io>This is a hint.</p> </div> </div> </div>  ${renderScript($$result, "/app/src/ui/components/HintPopup.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/HintPopup.astro", void 0);

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$Astro$3 = createAstro();
const $$StreakCounter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$StreakCounter;
  const { id = "streak-counter" } = Astro2.props;
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", "<div", ' class="combo-popup hidden" data-astro-cid-tpewwoyt> <div class="combo-content" data-astro-cid-tpewwoyt> <div class="combo-icon" data-astro-cid-tpewwoyt>\u{1F525}</div> <div class="combo-text" data-astro-cid-tpewwoyt></div> <div class="combo-subtext" data-astro-cid-tpewwoyt>Keep it up!</div> </div> </div>  <script>(function(){', "\n  class StreakCounterController {\n      constructor(rootId) {\n          this.el = document.getElementById(rootId);\n          if(!this.el) return;\n          \n          this.textEl = this.el.querySelector('.combo-text');\n          this.contentEl = this.el.querySelector('.combo-content');\n          \n          this.el.streakInstance = this;\n      }\n      \n      show(streakCount) {\n          if(!this.el || !this.textEl) return;\n          \n          this.textEl.textContent = `${streakCount} STREAK!`;\n          this.el.classList.remove('hidden');\n          this.contentEl.classList.add('pop-in');\n          \n          // Auto hide after 2s\n          setTimeout(() => {\n              this.contentEl.classList.remove('pop-in');\n              setTimeout(() => {\n                   this.el.classList.add('hidden');\n              }, 300);\n          }, 2000);\n      }\n  }\n  \n  new StreakCounterController(id);\n})();<\/script>"], ["", "<div", ' class="combo-popup hidden" data-astro-cid-tpewwoyt> <div class="combo-content" data-astro-cid-tpewwoyt> <div class="combo-icon" data-astro-cid-tpewwoyt>\u{1F525}</div> <div class="combo-text" data-astro-cid-tpewwoyt></div> <div class="combo-subtext" data-astro-cid-tpewwoyt>Keep it up!</div> </div> </div>  <script>(function(){', "\n  class StreakCounterController {\n      constructor(rootId) {\n          this.el = document.getElementById(rootId);\n          if(!this.el) return;\n          \n          this.textEl = this.el.querySelector('.combo-text');\n          this.contentEl = this.el.querySelector('.combo-content');\n          \n          this.el.streakInstance = this;\n      }\n      \n      show(streakCount) {\n          if(!this.el || !this.textEl) return;\n          \n          this.textEl.textContent = \\`\\${streakCount} STREAK!\\`;\n          this.el.classList.remove('hidden');\n          this.contentEl.classList.add('pop-in');\n          \n          // Auto hide after 2s\n          setTimeout(() => {\n              this.contentEl.classList.remove('pop-in');\n              setTimeout(() => {\n                   this.el.classList.add('hidden');\n              }, 300);\n          }, 2000);\n      }\n  }\n  \n  new StreakCounterController(id);\n})();<\/script>"])), maybeRenderHead(), addAttribute(id, "id"), defineScriptVars({ id }));
}, "/app/src/ui/components/modules/StreakCounter.astro", void 0);

const $$SpeedrunScreen = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="screen speedrun-screen" id="speedrun-screen"> <div class="screen-wrapper"> ${renderComponent($$result, "GameHeader", $$GameHeader, { "mode": "challenge", "id": "sr-header" })} <div class="sr-content"> <!-- Question Container wraps Display + StressBar logic --> ${renderComponent($$result, "QuestionContainer", $$QuestionContainer, { "id": "sr-question-container", "enableStressBar": true })} </div> ${renderComponent($$result, "GameFooter", $$GameFooter, { "id": "sr-footer" })} ${renderComponent($$result, "HintPopup", $$HintPopup, { "id": "sr-hint-popup" })} <!-- Module: Streak Counter --> ${renderComponent($$result, "StreakCounter", $$StreakCounter, { "id": "sr-streak" })} </div> </div> ${renderScript($$result, "/app/src/ui/screens/challenge-screens/SpeedrunScreen.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/screens/challenge-screens/SpeedrunScreen.astro", void 0);

const $$PracticeScreen = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="screen practice-screen" id="practice-screen"> <div class="screen-wrapper"> ${renderComponent($$result, "GameHeader", $$GameHeader, { "mode": "practice", "id": "pc-header" })} <div class="pc-content"> ${renderComponent($$result, "QuestionContainer", $$QuestionContainer, { "id": "pc-question-container", "enableStressBar": false })} </div> ${renderComponent($$result, "GameFooter", $$GameFooter, { "id": "pc-footer" })} ${renderComponent($$result, "HintPopup", $$HintPopup, { "id": "pc-hint-popup" })} </div> </div> ${renderScript($$result, "/app/src/ui/screens/practice-screens/PracticeScreen.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/screens/practice-screens/PracticeScreen.astro", void 0);

const $$Astro$2 = createAstro();
const $$Flashcard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Flashcard;
  const { frontText = "Term Name", backText = "Definition text..." } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="flashcard-scene"> <div class="flashcard-inner"> <div class="flashcard-face flashcard-front-face"> <h2 class="fc-term-title">${frontText}</h2> <p class="fc-tap-hint">(Tap to flip)</p> </div> <div class="flashcard-face flashcard-back-face"> <div class="fc-content-text">${backText}</div> </div> </div> </div> ${renderScript($$result, "/app/src/ui/components/Flashcards/Flashcard.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/components/Flashcards/Flashcard.astro", void 0);

const $$FlashcardScreen = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="screen flashcard-screen" id="flashcard-screen" data-astro-cid-zezvgefy> <div class="screen-wrapper" data-astro-cid-zezvgefy> <div class="fc-header" data-astro-cid-zezvgefy> ${renderComponent($$result, "BackButton", $$BackButton, { "data-astro-cid-zezvgefy": true })} <div class="fc-progress" id="fc-progress" data-astro-cid-zezvgefy>Card 1 / 10</div> </div> <div class="pc-content" data-astro-cid-zezvgefy> <div class="flashcard-container-wrapper" data-astro-cid-zezvgefy> ${renderComponent($$result, "Flashcard", $$Flashcard, { "data-astro-cid-zezvgefy": true })} </div> <div class="fc-controls" data-astro-cid-zezvgefy> <button class="btn btn-secondary" id="fc-prev-btn" data-astro-cid-zezvgefy>PREV</button> <button class="btn btn-primary" id="fc-reveal-btn" data-astro-cid-zezvgefy>REVEAL</button> <button class="btn btn-success hidden" id="fc-know-btn" data-astro-cid-zezvgefy>I KNEW IT</button> <button class="btn btn-danger hidden" id="fc-dont-know-btn" data-astro-cid-zezvgefy>STUDY AGAIN</button> <button class="btn btn-secondary" id="fc-next-btn" data-astro-cid-zezvgefy>NEXT</button> </div> </div> </div> </div>  ${renderScript($$result, "/app/src/ui/screens/practice-screens/FlashcardScreen.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/screens/practice-screens/FlashcardScreen.astro", void 0);

const $$ResultsScreen = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="screen" id="resultsScreen"> <div class="container container-narrow"> <div class="card results-container"> <div class="results-header"> <div> <h2 class="mission-title">MISSION REPORT</h2> <p class="mission-status">CLEARANCE LEVEL: MAX</p> </div> </div> <div class="grade-box"> <div class="grade-label">GRADE</div> <div id="finalGrade" class="grade-value">?</div> </div> </div> <div class="report-grid"> <!-- Accuracy --> <div class="report-cell cell-border-right cell-border-bottom"> <div class="stat-lbl text-muted">ACCURACY</div> <div id="finalScore" class="stat-val">0%</div> </div> <!-- Time --> <div class="report-cell cell-border-bottom"> <div class="stat-lbl text-muted">DURATION</div> <div id="finalTime" class="stat-val">00:00</div> </div> <!-- Correct --> <div class="report-cell cell-border-right"> <div class="stat-lbl text-success">SUCCESSFUL</div> <div id="correctCount" class="stat-val">0</div> </div> <!-- Incorrect --> <div class="report-cell"> <div class="stat-lbl text-error">FAILED</div> <div id="incorrectCount" class="stat-val">0</div> </div> </div> <div class="action-buttons"> <button class="btn btn-secondary review-btn" onclick="window.game.showReview()">
REVIEW LOGS
</button> <button class="btn btn-primary return-btn" onclick="window.game.goHome()">
RETURN TO BASE
</button> </div> </div> </div> <div class="card review-container hidden" id="reviewContainer"> <div class="review-header"> <h3 class="review-title">MISSION DEBRIEF</h3> </div> <div id="reviewContent" class="review-content"></div> <button class="btn btn-secondary close-btn" onclick="document.getElementById('reviewContainer').classList.add('hidden')">CLOSE DEBRIEF</button> </div> ${renderScript($$result, "/app/src/ui/screens/ResultsScreen.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/screens/ResultsScreen.astro", void 0);

const $$RevisionScreen = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="screen revision-screen" id="revisionScreen"> <div class="revision-header"> <button class="back-btn" onclick="window.game.goHome()">← HOME</button> <h2>ENCYCLOPEDIA</h2> <div class="search-bar"> <input type="text" id="revSearch" placeholder="Search terms or questions..."> </div> </div> <div class="revision-content" id="revisionContent"> <!-- Dynamic Content --> </div> </div> ${renderScript($$result, "/app/src/ui/screens/RevisionScreen.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/screens/RevisionScreen.astro", void 0);

const $$AchievementsScreen = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="screen" id="achievementsScreen"> <div class="header"> <h1>🏆 Achievements</h1> <!-- <p id="achievementStats">0 / 30 Unlocked</p> --> </div> <div class="container"> <div id="achievementsList" class="achievements-grid"></div> <button class="btn btn-secondary" onclick="window.game.goHome()" style="margin-top:20px">
← Back to Home
</button> </div> </div> ${renderScript($$result, "/app/src/ui/screens/AchievementsScreen.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/ui/screens/AchievementsScreen.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro$1 = createAstro();
const $$Mold = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Mold;
  const { subject } = Astro2.props;
  return renderTemplate(_a || (_a = __template(["", '<div id="loading-overlay" style="position: fixed; inset: 0; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; z-index: 9999;"> <div> <h2>Loading Assets...</h2> <p id="loading-status">Synchronizing subject data</p> </div> </div> <div class="mold-container" style="display: none;" id="game-container"> ', " <!-- Consolidated Challenge Mode Screen --> ", " <!-- Practice Modes --> ", " ", " <!-- Utility Screens --> ", " ", " ", ' <div class="combo-popup" id="comboPopup"> <div class="combo-text" id="comboText"></div> </div> </div> ', " <script>(function(){", "\n    window.subjectData = subject;\n})();<\/script>"])), maybeRenderHead(), renderComponent($$result, "HomeScreen", $$HomeScreen, { "subjectName": subject.name, "description": subject.config.description }), renderComponent($$result, "SpeedrunScreen", $$SpeedrunScreen, {}), renderComponent($$result, "PracticeScreen", $$PracticeScreen, {}), renderComponent($$result, "FlashcardScreen", $$FlashcardScreen, {}), renderComponent($$result, "ResultsScreen", $$ResultsScreen, {}), renderComponent($$result, "RevisionScreen", $$RevisionScreen, {}), renderComponent($$result, "AchievementsScreen", $$AchievementsScreen, {}), renderScript($$result, "/app/src/ui/Mold.astro?astro&type=script&index=0&lang.ts"), defineScriptVars({ subject }));
}, "/app/src/ui/Mold.astro", void 0);

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { subject: subjectId } = Astro2.params;
  let subject = null;
  let error = null;
  try {
    if (subjectId) {
      subject = await Subject.load(subjectId);
    } else {
      error = "No subject ID provided";
    }
  } catch (e) {
    console.error("Failed to load subject", subjectId, e);
    error = e.message || "Failed to load subject.";
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": subject ? subject.name : "Error", "description": subject?.config?.description || "Study materials and quizzes", "themeColor": subject?.config?.themeColor }, { "default": async ($$result2) => renderTemplate`${subject ? renderTemplate`${renderComponent($$result2, "Mold", $$Mold, { "subject": subject })}` : renderTemplate`${maybeRenderHead()}<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;color:white"> <h1>Error Loading Subject</h1> <p>${error}</p> <a href="/" style="color:var(--accent);margin-top:20px">
Return Home
</a> </div>`}` })}`;
}, "/app/src/pages/[subject]/index.astro", void 0);

const $$file = "/app/src/pages/[subject]/index.astro";
const $$url = "/[subject]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
