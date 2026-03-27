import { JSDOM } from 'jsdom';

// Setup JSDOM
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
  <body>
    <div id="screen1" class="screen"></div>
    <div id="screen2" class="screen"></div>
    <div id="screen3" class="screen"></div>
    <div id="screen4" class="screen"></div>
    <div id="screen5" class="screen"></div>
    <div>Not a screen</div>
    <div>Also not a screen</div>
    <!-- Add some extra nested DOM to make queries realistic -->
    <div>
      <div>
        <div class="screen" id="screen6"></div>
      </div>
    </div>
  </body>
  </html>
`);

const { window } = dom;
const document = window.document;

const screenId = 'screen3';
let cachedScreens: NodeListOf<Element> | null = null;

function runBaseline() {
  document.querySelectorAll('.screen').forEach(s => {
    if (s.id !== screenId) {
      s.classList.remove('active');
    }
  });
}

function runOptimized() {
  if (!cachedScreens) {
    cachedScreens = document.querySelectorAll('.screen');
  }
  cachedScreens.forEach(s => {
    if (s.id !== screenId) {
      s.classList.remove('active');
    }
  });
}

function runBenchmark(name: string, fn: () => void, iterations = 100000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return end - start;
}

// Warmup
runBaseline();
runOptimized();
runBaseline();
runOptimized();

const ITERATIONS = 100000;

console.log('Running benchmark...');
const baselineTime = runBenchmark('Baseline', runBaseline, ITERATIONS);
console.log(`Baseline time: ${baselineTime.toFixed(2)}ms`);

const optimizedTime = runBenchmark('Optimized', runOptimized, ITERATIONS);
console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);

console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}% faster`);
console.log(`x${(baselineTime / optimizedTime).toFixed(2)} performance multiplier`);
