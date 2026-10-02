// Ivy Falls: page-level behaviour. Phase 2 covers the question-mark stream on
// the cover, the byline hover, and the reading-progress bar.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Seeded so the reduced-motion still frame is identical on every load.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Question-mark stream ----------
//
// Marks fall from the top of the page, land on the title near its middle,
// flow right along the top of the line, drop off its end (onto a lower line
// if one sticks out further, like a tiered fall) and spill off the bottom.

const cover = document.querySelector('.cover');
const stream = document.querySelector('.qstream');
const title = document.querySelector('.cover__title');

const GRAVITY = 2600;     // px/s²
const STEP = 1 / 30;      // simulation step, s
const SPAWN_EVERY = 0.09; // s between marks

let geo = null;

// Where the tops of the title's lines are, relative to the cover.
function measure() {
  const c = cover.getBoundingClientRect();
  const fs = parseFloat(getComputedStyle(title).fontSize);
  const range = document.createRange();
  range.selectNodeContents(title);
  // One rect per line (merge any fragments that share a line).
  const lines = [];
  for (const r of range.getClientRects()) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.top - r.top) < 2) {
      last.left = Math.min(last.left, r.left);
      last.right = Math.max(last.right, r.right);
    } else {
      lines.push({ top: r.top, left: r.left, right: r.right });
    }
  }
  // The content box starts above the letters; drop the ledge to the tops of
  // the lowercase ascenders and capitals.
  const ledges = lines.map((l) => ({
    y: l.top - c.top + fs * 0.33,
    left: l.left - c.left + fs * 0.05,
    right: l.right - c.left - fs * 0.02,
  }));
  const first = ledges[0];
  const probe = document.createElement('span');
  probe.className = 'qmark';
  stream.append(probe);
  const markSize = parseFloat(getComputedStyle(probe).fontSize) || 24;
  probe.remove();
  return {
    ledges,
    width: c.width,
    height: c.height,
    centerX: (first.left + first.right) / 2,
    lineWidth: first.right - first.left,
    markSize,
  };
}

// Simulate one mark and return its path as [x, y, rotation] samples.
function simulate(g, rand) {
  const flow = g.lineWidth * (0.38 + rand() * 0.22);
  let x = g.centerX + (rand() - 0.5) * g.lineWidth * 0.08;
  let y = -g.markSize * 1.5;
  let vx = 0;
  let vy = rand() * 120;
  let rot = (rand() - 0.5) * 30;
  const spin = (rand() - 0.5) * 360;
  let ledge = null;
  let t = 0;
  const path = [];

  while (y < g.height + g.markSize * 2 && path.length < 400) {
    path.push([x, y, rot]);
    t += STEP;
    if (ledge) {
      vx += (flow - vx) * Math.min(1, STEP * 4);
      x += vx * STEP;
      rot = Math.sin(t * 9) * 7;
      if (x > ledge.right) { ledge = null; vy = 0; }
    } else {
      const prevY = y;
      vy += GRAVITY * STEP;
      x += vx * STEP;
      y += vy * STEP;
      rot += spin * STEP;
      const hit = g.ledges.find((l) => prevY <= l.y && y >= l.y && x >= l.left && x <= l.right);
      if (hit) {
        ledge = hit;
        y = hit.y;
        vy = 0;
        vx = Math.max(vx, flow * 0.15);
      }
    }
  }
  path.push([x, y, rot]);
  return path;
}

function makeMark(rand) {
  const q = document.createElement('span');
  q.className = 'qmark';
  q.textContent = '?';
  q.style.setProperty('--s', (0.6 + rand() * 0.9).toFixed(2));
  q.style.setProperty('--w', String(500 + Math.floor(rand() * 5) * 100)); // 500–900
  q.style.opacity = (0.55 + rand() * 0.45).toFixed(2);
  return q;
}

// Anchor each mark by the bottom-centre of its glyph so it sits on the ledge.
const place = ([x, y, r]) => `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -82%) rotate(${r.toFixed(1)}deg)`;

function launch(rand) {
  const path = simulate(geo, rand);
  const q = makeMark(rand);
  stream.append(q);
  const anim = q.animate(path.map((p) => ({ transform: place(p) })), {
    duration: (path.length - 1) * STEP * 1000,
    easing: 'linear',
    fill: 'forwards',
  });
  anim.onfinish = () => q.remove();
}

// Reduced motion: a still frame of the stream, marks spaced along one path.
function drawStill() {
  stream.replaceChildren();
  const rand = mulberry32(1917);
  const path = simulate(geo, rand);
  for (let i = 0; i < path.length; i += 3) {
    const q = makeMark(rand);
    q.style.transform = place(path[i]);
    stream.append(q);
  }
}

let running = false;
let coverVisible = true;
let last = 0;
let carry = 0;
const rand = Math.random;

function tick(now) {
  if (!running) return;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (coverVisible && !document.hidden) {
    carry += dt;
    while (carry >= SPAWN_EVERY) {
      carry -= SPAWN_EVERY;
      launch(rand);
    }
  }
  requestAnimationFrame(tick);
}

function start() {
  geo = measure();
  if (reduceMotion.matches) {
    running = false;
    drawStill();
    return;
  }
  stream.replaceChildren();
  if (!running) {
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  }
}

if (cover && stream && title) {
  // Wait for the display font so the ledges match the real letters.
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start, 150);
  });
  reduceMotion.addEventListener('change', start);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { coverVisible = e.isIntersecting; }).observe(cover);
  }
}

// ---------- Byline: letters hop on hover ----------

const bounce = document.querySelector('.bounce');
if (bounce) {
  const text = bounce.textContent;
  bounce.replaceChildren(...[...text].map((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.style.setProperty('--i', i);
    s.textContent = ch;
    return s;
  }));
}

// ---------- Reading progress ----------

const bar = document.querySelector('.progress__bar');
let queued = false;

function updateProgress() {
  queued = false;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  bar.style.transform = `scaleX(${p})`;
}

if (bar) {
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}
