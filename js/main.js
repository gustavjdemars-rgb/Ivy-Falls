// Ivy Falls: page-level behaviour. Phase 2 covers the reading-progress bar
// and the ring of question marks around the cover title.

// ---------- Question marks around the title ----------

// Seeded so the arrangement is identical on every load.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function placeQuestionMarks(container, count = 36) {
  const rand = mulberry32(1917);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A superellipse hugs the rectangular title block more closely than an ellipse,
  // keeping the marks in the padding band instead of over the letters.
  const n = 5;
  for (let i = 0; i < count; i++) {
    const t = ((i + rand() * 0.35) / count) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const rx = 42 + rand() * 6;
    const ry = 38 + rand() * 9;
    const x = 50 + rx * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = 50 + ry * Math.sign(s) * Math.abs(s) ** (2 / n);

    const q = document.createElement('span');
    q.className = 'qmark';
    q.textContent = '?';
    q.style.left = `${x.toFixed(2)}%`;
    q.style.top = `${y.toFixed(2)}%`;
    q.style.setProperty('--s', (0.55 + rand() * 1.25).toFixed(2));
    q.style.setProperty('--r', `${Math.round(rand() * 50 - 25)}deg`);
    q.style.setProperty('--w', String(300 + Math.floor(rand() * 6) * 100)); // 300–800
    q.style.setProperty('--o', (0.45 + rand() * 0.55).toFixed(2));
    if (!reduceMotion) q.style.setProperty('--d', `${(0.15 + (i / count) * 0.9).toFixed(2)}s`);
    container.append(q);
  }
}

const ring = document.querySelector('.qmarks');
if (ring) placeQuestionMarks(ring);

// ---------- Reading progress ----------

const bar = document.querySelector('.progress__bar');
let queued = false;

function updateProgress() {
  queued = false;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  bar.style.transform = `scaleX(${p})`;
}

function requestUpdate() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(updateProgress);
  }
}

if (bar) {
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateProgress();
}
