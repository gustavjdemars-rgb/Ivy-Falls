// Ivy Falls: page-level behaviour. Phase 2 covers the cover (question-mark
// cascade), weathered paper edges, the photo deck and the reading-progress
// bar.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Seeded so anything random (still frames, torn corners) is stable per load.
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
// Marks fall from the top of the page onto the "h" of "The" and cascade down
// the stepped title like water over rock ledges: along each line, off its end
// onto the longer line below, then off the end of "Waterfall" and down out of
// the cover. Every mark is a solid body: they knock into and rest against each
// other, never pass through one another.

const cover = document.querySelector('.cover');
const stream = document.querySelector('.qstream--front');
const streamBack = document.querySelector('.qstream--back'); // marks that pass behind the title
const title = document.querySelector('.cover__title');

const GRAVITY = 1700;     // px/s²
const STEP = 1 / 120;     // simulation step, s (small, so fast marks can't skip through each other)
const SPAWN_EVERY = 0.45; // s between marks: a sparse stream, each mark easy to see
const MAX_MARKS = 60;     // if marks pile up, hold the stream until they clear

let geo = null;

// Add ?debug to the URL to see the simulation drawn over the cover and live
// counts of marks that jitter, get stuck, or sit inside the letters.
const DEBUG = new URLSearchParams(location.search).has('debug');
const debugRand = mulberry32(7); // debug runs are repeatable

// Where the tops of the title's lines are, relative to the cover.
function measure() {
  const c = cover.getBoundingClientRect();
  const fs = parseFloat(getComputedStyle(title).fontSize);
  // Measure the words of each line (not the line boxes, which are all as wide
  // as the longest line), so each line is its own ledge: a staircase.
  const lines = [];
  for (const node of title.querySelectorAll('.cover__line')) {
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      const last = lines[lines.length - 1];
      if (last && Math.abs(last.top - r.top) < 2) {
        last.left = Math.min(last.left, r.left);
        last.right = Math.max(last.right, r.right);
      } else {
        lines.push({ top: r.top, left: r.left, right: r.right });
      }
    }
  }
  // The content box starts above the letters; drop the ledge to the tops of
  // the lowercase ascenders and capitals.
  const ledges = lines.map((l) => ({
    y: l.top - c.top + fs * 0.44,
    left: l.left - c.left + fs * 0.05,
    right: l.right - c.left - fs * 0.02,
    depth: fs * 0.7, // how far the letters run below the ledge (for the debug view)
  }));
  // No floor: off the end of "Waterfall", marks drop out of the bottom of the cover.

  // The white rule under the title follows the title's widest line.
  const widest = Math.max(...lines.map((l) => l.right - l.left));

  // The marks are sized from the title, so they keep the same proportions to
  // it on every screen.
  cover.style.setProperty('--title-fs', `${fs}px`);
  cover.style.setProperty('--title-w', `${Math.round(widest)}px`);

  // The gap between the baseline of "Waterfall" (no descenders) and the bottom
  // of the title box, so the rule can sit equally between letters and dek.
  const lastLine = title.querySelector('.cover__line:last-child');
  if (lastLine) {
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    lastLine.append(probe);
    const tail = title.getBoundingClientRect().bottom - probe.getBoundingClientRect().top;
    probe.remove();
    cover.style.setProperty('--title-tail', `${Math.max(0, Math.round(tail))}px`);
  }

  // Where the stream lands: the "h" of "The".
  let dropX = ledges[0].left + fs * 0.6;
  let dropW = fs * 0.4;
  const firstLine = title.querySelector('.cover__line');
  const text = firstLine ? firstLine.firstChild : title.firstChild;
  if (text && text.nodeType === Node.TEXT_NODE && text.length > 1) {
    const h = document.createRange();
    h.setStart(text, 1);
    h.setEnd(text, 2);
    const r = h.getBoundingClientRect();
    dropX = r.left - c.left + r.width / 2;
    dropW = r.width;
  }

  const probe = document.createElement('span');
  probe.className = 'qmark';
  stream.append(probe);
  const markSize = parseFloat(getComputedStyle(probe).fontSize) || 24;
  probe.remove();

  return {
    ledges,
    width: c.width,
    height: c.height,
    dropX,
    dropW,
    lineWidth: widest, // flow speed scales with the title, not the short first line
    markSize,
  };
}

// Set when the device can't keep up (see tick): marks go flat and fewer spawn.
let lowPower = false;
const LAYERS = 11;

function makeMark(rand, s) {
  const q = document.createElement('span');
  q.className = 'qmark';
  // A stack of layers gives each mark depth when it turns.
  const layers = lowPower ? 1 : LAYERS;
  for (let i = 0; i < layers; i++) {
    const layer = document.createElement('span');
    layer.className = 'qmark__layer';
    layer.style.setProperty('--i', i);
    layer.textContent = '?';
    q.append(layer);
  }
  q.style.setProperty('--s', s.toFixed(2));
  q.style.setProperty('--w', String(600 + Math.floor(rand() * 4) * 100)); // 600–900
  if (rand() < 0.25) q.style.setProperty('--c', 'var(--blue-deep)'); // mostly the brighter blue
  return q;
}

// Each mark is a round body about as tall as its glyph, centred on the glyph,
// so marks touch at their outlines rather than overlapping.
let marks = [];

function spawn(rand) {
  const g = geo;
  const s = 0.65 + rand() ** 1.6 * 1.15; // mostly mid-size, a few big
  const size = g.markSize * s;
  const r = size * 0.3; // a little inside the glyph's outline, so a soft squish never shows
  const foot = size * 0.36; // centre to the bottom of the glyph, for sitting on a line
  const el = makeMark(rand, s);
  // Every mark travels behind the title text, so none ever covers the letters
  // (author request, 2026-10-09). The draw is kept so the seeded stream, and
  // so the whole cascade, moves exactly as before.
  rand();
  (streamBack || stream).append(el);
  marks.push({
    el, r, foot, size,
    m: s * s,
    x: g.dropX + (rand() - 0.5) * g.dropW * 0.6,
    y: -r * 2.5,
    px: 0,
    py: 0,
    vx: 0,
    vy: rand() * 60,
    flow: g.lineWidth * (0.22 + rand() * 0.08), // unhurried, like water finding the edge
    ledge: null,
    phase: rand() * Math.PI * 2,
    // Slow turns about both the horizontal and the vertical axis, either way.
    rx: rand() * 360,
    ry: rand() * 360,
    wrx: (35 + rand() * 40) * (rand() < 0.5 ? -1 : 1),
    wry: (30 + rand() * 40) * (rand() < 0.5 ? -1 : 1),
    rz: (rand() - 0.5) * 30,
    wrz: (rand() - 0.5) * 80, // a slow tumble while falling, never a spin
    supportedAt: -1,
  });
  const b = marks[marks.length - 1];
  b.px = b.x;
  b.py = b.y;
}

// The marks move like something thick and soft (syrup, or jello) rather than
// hard pieces: every contact is a soft cushion that's damped just enough to
// settle without wobbling, so all motion comes from smooth forces and nothing
// ever snaps into place.
const SOFT = 900;        // how firm a contact is (per unit of mass), s⁻²
const SETTLE = 60;       // contact damping; 2·√SOFT, so contacts settle without bouncing
const STICKY = 0.35;     // neighbours drag on each other a little, like something viscous
const FALL_SPEED = 380;  // marks sink through thick air and never fall faster than about this, px/s
const FLOW_GRIP = 2.5;   // how quickly a mark on a line takes up the stream's speed, s⁻¹

// The water surface along each line: one slow wave, so neighbouring marks
// rise and fall almost together.
function surface(l, x, t) {
  const g = geo;
  return l.y - g.markSize * 0.06 * (0.5 + 0.5 * Math.sin((x / (g.markSize * 4)) * Math.PI * 2 - t * 2));
}

function step(t) {
  const g = geo;
  const wall = g.ledges[0].left;
  const lastLedge = g.ledges[g.ledges.length - 1].y;

  for (const b of marks) {
    b.px = b.x;
    b.py = b.y;
    b.ax = 0;
    b.ay = GRAVITY;
  }

  // Soft contacts between marks: a cushion pushes overlapping marks apart,
  // damped so they ease apart instead of bouncing, with a little drag along
  // the contact so neighbours flow together.
  for (let i = 0; i < marks.length; i++) {
    const a = marks[i];
    for (let j = i + 1; j < marks.length; j++) {
      const b = marks[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const min = a.r + b.r;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min) continue;
      const d = Math.sqrt(d2) || 0.01;
      const nx = d2 ? dx / d : 0;
      const ny = d2 ? dy / d : 1;
      const mu = (a.m * b.m) / (a.m + b.m);
      const rvx = b.vx - a.vx;
      const rvy = b.vy - a.vy;
      const vn = rvx * nx + rvy * ny;
      const vt = -rvx * ny + rvy * nx;
      const fn = Math.max(0, mu * (SOFT * (min - d) - SETTLE * vn));
      const ft = -mu * SETTLE * STICKY * vt;
      const fx = nx * fn - ny * ft;
      const fy = ny * fn + nx * ft;
      b.ax += fx / b.m;
      b.ay += fy / b.m;
      a.ax -= fx / a.m;
      a.ay -= fy / a.m;
      // Resting on top of another mark: float along with the stream.
      if (ny < -0.3) b.supportedAt = t;
      if (ny > 0.3) a.supportedAt = t;
    }
  }

  for (const b of marks) {
    // On a line: held up by the surface (the same soft cushion) and carried
    // along by the stream. A mark leaves its line once its centre passes the
    // right-hand end, and then simply falls.
    if (b.ledge && (b.x > b.ledge.right || b.x < b.ledge.left - b.r)) b.ledge = null;
    const floating = b.ledge || b.supportedAt > t - 0.15;
    if (b.ledge) {
      const p = b.y + b.foot - surface(b.ledge, b.x, t);
      if (p > 0) b.ay -= SOFT * p + SETTLE * 2 * b.vy; // extra damping soaks up a landing over a few frames
    }
    if (floating) b.ax += (b.flow - b.vx) * FLOW_GRIP;
    else b.ax -= b.vx * 0.4; // a little drag in the air
    b.ay -= b.vy * (GRAVITY / FALL_SPEED); // thick air: the fall eases up to its top speed
    // A soft wall at the title's left edge.
    if (b.y < lastLedge) {
      const p = wall + b.r * 0.6 - b.x;
      if (p > 0) b.ax += SOFT * p - SETTLE * Math.min(0, b.vx);
    }

    const prevBottom = b.y + b.foot;
    b.vx += b.ax * STEP;
    b.vy += b.ay * STEP;
    // Marks on a line never drift backwards, so none slip off the left.
    if (floating && b.vx < 0) b.vx *= 0.5;
    b.x += b.vx * STEP;
    b.y += b.vy * STEP;

    if (floating) {
      b.rz += (Math.sin(t * 1.8 + b.phase) * 6 - b.rz) * Math.min(1, STEP * 2);
    } else {
      b.rz += b.wrz * STEP;
    }
    b.rx += b.wrx * STEP;
    b.ry += b.wry * STEP;

    // Landing: only by crossing a line's surface from above (checked across
    // the whole step, so a fast mark can't slip past into the letters). The
    // fall is soaked up, like dropping into syrup.
    if (!b.ledge) {
      for (const l of g.ledges) {
        if (b.x < l.left || b.x > l.right) continue;
        const s = surface(l, b.x, t);
        if (prevBottom <= s + 1 && b.y + b.foot >= s) {
          b.ledge = l;
          b.landedAt = t;
          break;
        }
      }
    }
    // Safety net only: never deeper than a few pixels into the letters.
    if (b.ledge) {
      const s = surface(b.ledge, b.x, t);
      const deep = b.y + b.foot - (s + b.foot * 0.25);
      if (deep > 0) { b.y -= deep; b.vy = Math.min(b.vy, 0); }
    }
    if (b.y < lastLedge && b.x < wall) { b.x = wall; b.vx = Math.max(0, b.vx); }
  }

  // Gone once fully below the cover (or, rarely, knocked off a side).
  marks = marks.filter((b) => {
    const out = b.y - b.r > g.height || b.x + b.r < -g.width * 0.1 || b.x - b.r > g.width * 1.1;
    if (out) b.el.remove();
    return !out;
  });
}

// Draw each mark between its last two simulation steps (alpha 0–1), so motion
// is smooth whatever the screen's refresh rate. The glyph's centre sits about
// 46% of the way down its line box.
function render(alpha = 1) {
  for (const b of marks) {
    b.drawX = b.px + (b.x - b.px) * alpha;
    b.drawY = b.py + (b.y - b.py) * alpha;
    b.el.style.transform =
      `translate(${b.drawX.toFixed(2)}px, ${b.drawY.toFixed(2)}px) translate(-50%, -46%) ` +
      `perspective(${Math.round(b.size * 5)}px) rotate(${b.rz.toFixed(1)}deg) ` +
      `rotateX(${b.rx.toFixed(1)}deg) rotateY(${b.ry.toFixed(1)}deg)`;
  }
}

// ---- Debug view (?debug) ----
// Per mark, on what's actually drawn: jitter = direction reversals per second
// (a gentle bob alone gives about 1), stuck = sitting on a line without moving
// forward for over a second, inText = centre inside the letters of a line.
// Totals accumulate in window.__qdebug for headless checks (tools/probe.ps1).
let dbg = null;
function debugFrame(dt, t) {
  if (!dbg) {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;z-index:50;pointer-events:none';
    cover.append(cv);
    const hud = document.createElement('pre');
    hud.style.cssText = 'position:absolute;left:8px;bottom:8px;z-index:51;margin:0;padding:6px 8px;font:12px/1.4 monospace;color:#fff;background:rgba(0,0,0,.7)';
    cover.append(hud);
    dbg = { cv, hud, totals: { markFrames: 0, jitter: 0, stuck: 0, inText: 0, maxJitter: 0, seen: 0 } };
    window.__qdebug = dbg.totals;
  }
  const { cv, hud, totals } = dbg;
  if (cv.width !== geo.width || cv.height !== geo.height) { cv.width = geo.width; cv.height = geo.height; }
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.lineWidth = 1.5;
  for (const l of geo.ledges) {
    ctx.strokeStyle = 'rgba(80,255,120,.9)';
    ctx.beginPath(); ctx.moveTo(l.left, l.y); ctx.lineTo(l.right, l.y); ctx.stroke();
    ctx.strokeStyle = 'rgba(80,255,120,.25)';
    ctx.strokeRect(l.left, l.y, l.right - l.left, l.depth);
  }
  let nJ = 0, nS = 0, nT = 0;
  for (const b of marks) {
    const d = b.dbg || (b.dbg = { px: b.drawX, py: b.drawY, sx: 0, sy: 0, jit: 0, lastX: b.x, still: 0 });
    if (!d.counted) { d.counted = true; totals.seen++; }
    const dx = b.drawX - d.px, dy = b.drawY - d.py;
    const sx = Math.abs(dx) > 0.15 ? Math.sign(dx) : 0;
    const sy = Math.abs(dy) > 0.15 ? Math.sign(dy) : 0;
    let flips = 0;
    if (sx && d.sx && sx !== d.sx) flips++;
    if (sy && d.sy && sy !== d.sy) flips++;
    if (flips) {
      d.hist = (d.hist || []).slice(-11);
      d.hist.push([+t.toFixed(2), b.ledge ? 'ride' : b.supportedAt > t - 0.15 ? 'on' : 'fall', +dx.toFixed(2), +dy.toFixed(2)]);
    }
    if (sx) d.sx = sx;
    if (sy) d.sy = sy;
    // A jolt: a sudden change of speed between frames (what reads as shaking).
    // Landing is the one place a quick change is expected, so it isn't counted.
    const landed = b.landedAt > t - 0.15;
    if (d.pdx !== undefined && !landed && Math.hypot(dx - d.pdx, dy - d.pdy) > 1.2) {
      totals.jolts = (totals.jolts || 0) + 1;
      const why = b.ledge ? (b.supportedAt > t - 0.15 ? 'ride+touch' : 'ride') : b.supportedAt > t - 0.15 ? 'air+touch' : 'air';
      totals.joltKinds = totals.joltKinds || {};
      totals.joltKinds[why] = (totals.joltKinds[why] || 0) + 1;
      if (!totals.joltSample || totals.joltSample.length < 6) (totals.joltSample = totals.joltSample || []).push([why, +t.toFixed(2), +(dx - d.pdx).toFixed(1), +(dy - d.pdy).toFixed(1), +d.pdy.toFixed(1)]);
    }
    d.pdx = dx; d.pdy = dy;
    d.px = b.drawX; d.py = b.drawY;
    d.jit = d.jit * Math.exp(-dt) + flips; // ≈ reversals per second
    const resting = b.ledge || b.supportedAt > t - 0.15;
    if (!resting || b.x - d.lastX > 4) { d.lastX = b.x; d.still = 0; } else d.still += dt;
    const jittery = d.jit > 3;
    const stuck = d.still > 1;
    const inText = geo.ledges.some((l) => b.x > l.left && b.x < l.right && b.y > l.y + 2 && b.y < l.y + l.depth);
    totals.markFrames++;
    if (jittery) { totals.jitter++; nJ++; 
      const kind = b.ledge ? "riding" : b.supportedAt > t - 0.15 ? "on-mark" : "falling";
      totals.kinds = totals.kinds || {};
      totals.kinds[kind] = (totals.kinds[kind] || 0) + 1;
    }
    if (stuck) { totals.stuck++; nS++; }
    if (inText) { totals.inText++; nT++; }
    if (d.jit > totals.maxJitter) totals.worst = { r: +b.r.toFixed(1), hist: d.hist };
    totals.maxJitter = Math.max(totals.maxJitter, d.jit);
    ctx.strokeStyle = inText ? '#ff40ff' : stuck ? '#ffa000' : jittery ? '#ff3030' : 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
  }
  hud.textContent =
    `marks ${marks.length}  t ${t.toFixed(1)}s\n` +
    `now:  jitter ${nJ}  stuck ${nS}  in text ${nT}\n` +
    `total mark-frames ${totals.markFrames}\n` +
    `  jitter ${totals.jitter}  stuck ${totals.stuck}  in text ${totals.inText}\n` +
    `  worst jitter ${totals.maxJitter.toFixed(1)}/s  jolts ${totals.jolts || 0}\n` +
    'white ok · red jitter · orange stuck · pink in text';
}

function clearMarks() {
  marks = [];
  stream.replaceChildren();
  if (streamBack) streamBack.replaceChildren();
}

// Reduced motion: a still frame of the stream, taken from a few seconds of
// the same simulation run ahead of time.
function drawStill() {
  clearMarks();
  const rand = mulberry32(1917);
  let t = 0;
  let carry = 0;
  while (t < 9) {
    carry += STEP;
    if (carry >= SPAWN_EVERY) { carry -= SPAWN_EVERY; spawn(rand); }
    step(t);
    t += STEP;
  }
  render();
}

let running = false;
let coverVisible = true;
let last = 0;
let carry = 0;
let simTime = 0;
let simCarry = 0;

// Frame-time watch: if frames average slower than ~30 fps for a few seconds,
// switch to flat marks and a thinner stream.
let frameAvg = 16;
let slowFor = 0;

function tick(now) {
  if (!running) return;
  const raw = (now - last) / 1000;
  const dt = Math.min(0.1, raw);
  last = now;
  if (coverVisible && !document.hidden) {
    if (!lowPower && raw < 0.5) {
      frameAvg += (raw * 1000 - frameAvg) * 0.05;
      slowFor = frameAvg > 33 ? slowFor + dt : 0;
      if (slowFor > 3) lowPower = true;
    }
    carry += dt;
    const every = lowPower ? SPAWN_EVERY * 1.6 : SPAWN_EVERY;
    while (carry >= every) {
      carry -= every;
      if (marks.length < MAX_MARKS) spawn(DEBUG ? debugRand : Math.random);
    }
    simCarry += dt;
    while (simCarry >= STEP) {
      simCarry -= STEP;
      step(simTime);
      simTime += STEP;
    }
    render(simCarry / STEP);
    if (DEBUG) debugFrame(dt, simTime);
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
  clearMarks();
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

// ---------- Weathered paper ----------
//
// Sheets, cards and clippings pick up a little wear, at random but stable per
// load: a torn corner, a folded-over corner, a split running in from an edge,
// or a few small nicks. Most pieces get one or two marks; some stay crisp.
// The cuts are a clip-path on the paper layer only, so text is never clipped.

function weather(rand) {
  const pt = (xp, xpx, yp, ypx) => `calc(${xp}% + ${xpx.toFixed(1)}px) calc(${yp}% + ${ypx.toFixed(1)}px)`;
  const folds = [];
  let marked = 0;

  const corner = (cx, cy) => {
    // cx, cy: 0 or 1 (left/right, top/bottom). Returns clockwise points.
    const sx = cx ? -1 : 1;
    const sy = cy ? -1 : 1;
    const X = cx * 100;
    const Y = cy * 100;
    const roll = rand();
    if (marked >= 2 || roll > 0.42) return [pt(X, 0, Y, 0)];
    marked++;
    const clockwise = (onH, onV, mid) => (cx === cy ? [onV, ...mid, onH] : [onH, ...mid, onV]);

    if (roll < 0.17) {
      // Folded over: a straight diagonal cut, with the flap drawn on top.
      const s = 12 + rand() * 12;
      folds.push({ corner: `${cy ? 'b' : 't'}${cx ? 'r' : 'l'}`, size: s });
      return clockwise(pt(X, sx * s, Y, 0), pt(X, 0, Y, sy * s), []);
    }
    // Torn: a ragged bite out of the corner.
    const a = 6 + rand() * 12;
    const b = 6 + rand() * 12;
    const mids = [
      pt(X, sx * a * (0.55 + rand() * 0.2), Y, sy * b * (0.15 + rand() * 0.2)),
      pt(X, sx * a * (0.3 + rand() * 0.2), Y, sy * b * (0.45 + rand() * 0.25)),
    ];
    return clockwise(pt(X, sx * a, Y, 0), pt(X, 0, Y, sy * b), cx === cy ? mids.reverse() : mids);
  };

  // Along one edge: maybe a split (a narrow crack running in) or a few nicks.
  // `at(t, depth)` maps a position along the edge (0–100) and an inward depth.
  const edge = (at, reverse) => {
    const roll = rand();
    const out = [];
    const order = (ts) => ts.sort((p, q) => (reverse ? q - p : p - q));
    if (roll < 0.16 && marked < 3) {
      marked++;
      const t = 20 + rand() * 60;
      const depth = 10 + rand() * 16;
      const w = 0.35 + rand() * 0.3;
      const path = [[-w, 0], [-w * 0.2, depth * 0.55], [w * 0.15, depth], [w * 0.3, depth * 0.5], [w, 0]];
      for (const [dt, d] of reverse ? path.reverse() : path) out.push(at(reverse ? t - dt : t + dt, d));
    } else if (roll < 0.45) {
      for (const t of order(Array.from({ length: 1 + Math.floor(rand() * 2) }, () => 12 + rand() * 76))) {
        const depth = 1 + rand() * 2.5;
        for (const [dt, d] of [[-1, 0], [0, depth], [1, 0]]) out.push(at(reverse ? t - dt : t + dt, d));
      }
    }
    return out;
  };

  const polygon = 'polygon(' + [
    ...corner(0, 0),
    ...edge((t, d) => pt(t, 0, 0, d)),
    ...corner(1, 0),
    ...edge((t, d) => pt(100, -d, t, 0)),
    ...corner(1, 1),
    ...edge((t, d) => pt(t, 0, 100, -d), true),
    ...corner(0, 1),
    ...edge((t, d) => pt(0, d, t, 0), true),
  ].join(', ') + ')';
  return { polygon, folds };
}

{
  const rand = mulberry32(37);
  document.querySelectorAll('.sheet, .card, .clipping__paper').forEach((el) => {
    if (rand() < 0.7) return; // most stay crisp; a few show wear
    const { polygon, folds } = weather(rand);
    el.style.setProperty('--tatter', polygon);
    for (const f of folds) {
      const flap = document.createElement('span');
      flap.className = `dogear dogear--${f.corner}`;
      flap.setAttribute('aria-hidden', 'true');
      flap.style.setProperty('--fold', `${f.size.toFixed(1)}px`);
      el.append(flap);
    }
  });
}

// ---------- Photo deck ----------
//
// Five photos fanned like a hand of cards. The arrows rotate the hand in
// their direction; each card arcs to its new place, and a card wrapping from
// one end to the other slides around behind the hand. The middle card is
// raised and tilted, as if being chosen.

const deck = document.querySelector('.deck');
if (deck) {
  const hand = deck.querySelector('.deck__hand');
  const cards = [...deck.querySelectorAll('.deck__card')];
  const status = deck.querySelector('[data-deck-status]');
  const n = cards.length;
  let center = Math.floor(n / 2);

  const posOf = (i) => ((i - center + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
  const LOOK = {
    0: { lift: -12, rot: -3, scale: 1, z: 10, bright: 1 },
    1: { lift: 0, rot: 6, scale: 0.84, z: 6, bright: 0.94 },
    2: { lift: 5, rot: 11, scale: 0.7, z: 2, bright: 0.86 },
  };
  const spread = () => Math.min(230, Math.max(62, hand.clientWidth * 0.2));
  const look = (pos) => {
    const l = LOOK[Math.abs(pos)];
    const sign = Math.sign(pos) || 1;
    return { ...l, rot: Math.abs(pos) ? l.rot * sign : l.rot, x: pos * spread() };
  };
  const transformOf = ({ x, lift, rot, scale }) =>
    `translate(-50%, -50%) translateX(${x.toFixed(1)}px) translateY(${lift}%) rotate(${rot}deg) scale(${scale})`;

  function layout(animateFrom) {
    cards.forEach((card, i) => {
      const pos = posOf(i);
      const to = look(pos);
      card.classList.toggle('is-center', pos === 0);
      card.setAttribute('aria-hidden', String(pos !== 0));
      card.style.zIndex = to.z;
      card.style.filter = `brightness(${to.bright})`;
      card.style.transform = transformOf(to);

      if (!animateFrom || reduceMotion.matches) return;
      const fromPos = animateFrom[i];
      const from = look(fromPos);
      const wraps = Math.abs(pos - fromPos) > 1;
      // Midpoint: wrapping cards slip behind and under the hand; the card
      // becoming the middle one is drawn up a little higher, like a pick.
      const mid = wraps
        ? { x: 0, lift: 16, rot: 0, scale: 0.62 }
        : {
          x: (from.x + to.x) / 2,
          lift: pos === 0 ? -20 : (from.lift + to.lift) / 2 - 4,
          rot: pos === 0 ? -8 : (from.rot + to.rot) / 2,
          scale: (from.scale + to.scale) / 2,
        };
      if (wraps) card.style.zIndex = 1;
      const anim = card.animate([
        { transform: transformOf(from) },
        { transform: transformOf(mid), offset: 0.5 },
        { transform: transformOf(to) },
      ], { duration: 650, easing: 'cubic-bezier(.3, .7, .2, 1)' });
      if (wraps) anim.onfinish = () => { card.style.zIndex = to.z; };
    });
    if (status) status.textContent = `Photo ${center + 1} of ${n}`;
  }

  // dir: +1 moves the cards right, -1 moves them left.
  function rotate(dir) {
    const before = cards.map((_, i) => posOf(i));
    center = (center - dir + n) % n;
    layout(before);
  }

  // Each arrow sends the cards the opposite way to the arrow.
  deck.querySelector('.deck__arrow--prev').addEventListener('click', () => rotate(1));
  deck.querySelector('.deck__arrow--next').addEventListener('click', () => rotate(-1));
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); rotate(1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); rotate(-1); }
  });
  // Clicking a side card brings it to the middle.
  cards.forEach((card, i) => card.addEventListener('click', () => {
    const pos = posOf(i);
    if (pos) rotate(-Math.sign(pos));
  }));

  layout();
  window.addEventListener('resize', () => layout());
}

// ---------- Bank to bank (M2) ----------
// A simple red river, and a red point that bounces from bank to bank like a
// ball between two walls, turning back the moment it touches a bank, while it
// drifts slowly downstream, trailing a short fading tail, until it settles on
// one spot and pulses.
// Then it fades and starts again. Runs only while on screen; with reduced
// motion it shows the finished search as a still.

const viz = document.querySelector('.stage__viz');
if (viz) {
  const ctx = viz.getContext('2d');
  const RED = getComputedStyle(document.documentElement).getPropertyValue('--map-red').trim() || '#D7563F';
  const ACROSS = 1.4;   // s for each crossing, bank to bank
  const CROSSINGS = 11; // bounces before it settles
  const FROM = 0.12, TO = 0.8; // how far down the river it starts and stops (fractions)
  const TAIL = 1.4;     // s of trail behind the point
  const SETTLE = 3.2;   // s pulsing on the last spot
  const FADE = 0.7;     // s to fade out before starting again

  let W = 0, H = 0, line = [], hw = 0;
  const total = ACROSS * CROSSINGS;
  let trail = [], t0 = 0, running = false, visible = false;


  // The river's centre line, top to bottom, as a smooth curve through a few
  // points (fractions of the frame). On wide screens it keeps to the right,
  // clear of the text cards; on tall screens it runs down the middle.
  function build() {
    const r = viz.getBoundingClientRect();
    W = r.width; H = r.height;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    viz.width = Math.round(W * dpr); viz.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const wide = W > H * 1.1;
    const pts = (wide
      ? [[0.66, -0.08], [0.58, 0.17], [0.69, 0.41], [0.6, 0.65], [0.7, 0.88], [0.64, 1.08]]
      : [[0.56, -0.08], [0.38, 0.18], [0.62, 0.42], [0.4, 0.66], [0.6, 0.88], [0.52, 1.08]]
    ).map(([x, y]) => [x * W, y * H]);
    hw = Math.max(24, Math.min(58, Math.min(W, H) * 0.055));

    // Catmull-Rom through the points, then measure along it.
    line = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 60; k++) {
        const u = k / 60, u2 = u * u, u3 = u2 * u;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        line.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) });
      }
    }
    line.push({ x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] });
    let len = 0;
    line.forEach((p, i) => {
      if (i) len += Math.hypot(p.x - line[i - 1].x, p.y - line[i - 1].y);
      p.d = len;
    });
    line.forEach((p) => { p.d /= len; });

  }

  // A point across the river (side -1 to 1, bank to bank) at fraction f of the
  // way downstream.
  function bank(side, f) {
    let i = 1;
    while (i < line.length - 1 && line[i].d < f) i++;
    const a = line[i - 1], b = line[i];
    const u = (f - a.d) / ((b.d - a.d) || 1);
    const dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1;
    return { x: a.x + dx * u + (-dy / n) * hw * side, y: a.y + dy * u + (dx / n) * hw * side };
  }

  // Downstream at a steady pace; across in straight runs that turn back the
  // instant they reach a bank (a triangle wave from one bank to the other).
  function pointAt(t) {
    const u = Math.min(1, t / total);
    const k = (t / ACROSS) % 2;
    const side = k < 1 ? -1 + 2 * k : 3 - 2 * k;
    return bank(t >= total ? (CROSSINGS % 2 ? 1 : -1) : side, FROM + (TO - FROM) * u);
  }

  function drawRiver(alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = RED;
    ctx.shadowColor = RED;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      line.forEach((p, i) => {
        const q = i < line.length - 1 ? line[i + 1] : p, o = i ? line[i - 1] : p;
        const dx = q.x - o.x, dy = q.y - o.y, n = Math.hypot(dx, dy) || 1;
        const x = p.x + (-dy / n) * hw * side, y = p.y + (dx / n) * hw * side;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      });
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha * 0.55;
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPoint(p, alpha, pulse) {
    ctx.save();
    ctx.fillStyle = RED;
    ctx.strokeStyle = RED;
    ctx.shadowColor = RED;
    if (pulse !== undefined) {
      ctx.globalAlpha = alpha * 0.5 * (1 - pulse);
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, 7 + pulse * 18, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = alpha * 0.9;
    ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // The tail: recent positions, thinning and fading with age.
  function drawTrail(now, alpha) {
    ctx.save();
    ctx.strokeStyle = RED;
    ctx.shadowColor = RED;
    ctx.shadowBlur = 8;
    ctx.lineCap = 'round';
    for (let i = 1; i < trail.length; i++) {
      const age = (now - trail[i].t) / TAIL;
      if (age >= 1) continue;
      ctx.globalAlpha = alpha * 0.7 * (1 - age);
      ctx.lineWidth = 4 * (1 - age) + 0.5;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function frame(ms) {
    if (!running) return;
    const now = ms / 1000;
    if (!t0) t0 = now;
    let t = now - t0;
    if (t > total + SETTLE + FADE) { t0 = now; t = 0; trail = []; }

    ctx.clearRect(0, 0, W, H);
    drawRiver(1);
    const fade = t > total + SETTLE ? 1 - (t - total - SETTLE) / FADE : Math.min(1, t / 0.4);
    const p = pointAt(Math.min(t, total));
    trail.push({ x: p.x, y: p.y, t: now });
    while (trail.length && now - trail[0].t > TAIL) trail.shift();
    drawTrail(now, fade);
    drawPoint(p, fade, t > total ? ((t - total) % 1.6) / 1.6 : undefined);
    requestAnimationFrame(frame);
  }

  // Reduced motion: the whole search at once, faintly, ending on the spot.
  function drawStill() {
    ctx.clearRect(0, 0, W, H);
    drawRiver(1);
    ctx.save();
    ctx.strokeStyle = RED;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    for (let t = 0; t <= total; t += 0.05) {
      const p = pointAt(t);
      if (t) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
    drawPoint(pointAt(total), 1);
  }

  function update() {
    const play = visible && !reduceMotion.matches;
    if (play && !running) { running = true; t0 = 0; trail = []; requestAnimationFrame(frame); }
    if (!play) {
      running = false;
      if (W) drawStill();
    }
  }

  build();
  update();
  new ResizeObserver(() => { build(); trail = []; if (!running) update(); }).observe(viz);
  reduceMotion.addEventListener('change', update);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }).observe(viz);
  } else {
    visible = true; update();
  }
}

// ---------- Topographic reveal ----------
// The elevation map fades in over the first map once the "aha" card ("A quick
// look at a topographical map...") is a third of the way up the screen, and back out if
// the reader scrolls above it again.

const aha = document.querySelector('.card--aha');
const revealStage = aha && aha.closest('.stage');
if (revealStage && revealStage.querySelector('.stage__map--reveal')) {
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      revealStage.classList.toggle('is-revealed', e.isIntersecting || e.boundingClientRect.top < 0);
    }, { rootMargin: '0px 0px -33% 0px' }).observe(aha);
  } else {
    revealStage.classList.add('is-revealed');
  }
}

// ---------- The falls video ----------
// Plays muted on a loop while it's on screen and pauses when it scrolls away.
// Nothing downloads until it first comes into view. If the reader pauses it,
// it stays paused; with reduced motion it waits for the play button.

const film = document.querySelector('.film');
if (film) {
  const video = film.querySelector('video');
  const playBtn = film.querySelector('[data-film="play"]');
  const soundBtn = film.querySelector('[data-film="sound"]');
  let heldByReader = reduceMotion.matches;
  let inView = false;

  video.controls = false;
  film.querySelector('.film__controls').hidden = false;

  const sync = () => {
    film.classList.toggle('is-paused', video.paused);
    playBtn.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
  };
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();

  const update = () => {
    if (inView && !heldByReader) video.play().catch(() => {});
    else if (!video.paused) video.pause();
  };

  playBtn.addEventListener('click', () => {
    heldByReader = !video.paused;
    if (heldByReader) video.pause();
    else video.play().catch(() => {});
  });
  soundBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    soundBtn.setAttribute('aria-pressed', String(!video.muted));
    soundBtn.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    }, { threshold: 0.4 }).observe(film);
  }
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

// ---------- Byline flip ----------
// Each time the pointer arrives on the byline tag it turns over: first to
// "Read more", then back to the byline on the next hover.

const flip = document.querySelector('.flipcard');
if (flip) {
  flip.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') flip.classList.toggle('is-flipped');
  });
  // Keyboard users see the back while the link has focus.
  flip.addEventListener('focus', () => flip.classList.add('is-flipped'));
  flip.addEventListener('blur', () => flip.classList.remove('is-flipped'));
}
