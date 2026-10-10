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
// The walk photos fanned like a hand of cards. The arrows rotate the hand in
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
  const spread = () => Math.min(280, Math.max(56, hand.clientWidth * 0.19));
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
// A satellite view of the Mississippi between Minneapolis and St. Paul, and a
// red dot with a short glowing tail that bounces slowly from bank to bank
// like a ball between two walls, the walls being the river's real edges
// (traced from the image). It drifts downstream; off the bottom of the frame
// it comes back in at the top and goes again. Runs only while on screen;
// with reduced motion the dot rests mid-river.

const viz = document.querySelector('.stage__viz');
if (viz) {
  const ctx = viz.getContext('2d');
  const RED = getComputedStyle(document.documentElement).getPropertyValue('--map-red').trim() || '#D7563F';
  const IMG_W = 2056, IMG_H = 992;
  // The river's banks: [y, left x, right x], fractions of the image.
  const BANKS = [[0.0,0.8186,0.8536],[0.0161,0.8207,0.8548],[0.0323,0.8239,0.8573],[0.0484,0.826,0.8598],[0.0645,0.8267,0.8617],[0.0806,0.8266,0.863],[0.0968,0.826,0.864],[0.1129,0.8246,0.8646],[0.129,0.8218,0.8644],[0.1452,0.8199,0.8635],[0.1613,0.8188,0.8619],[0.1774,0.8176,0.8586],[0.1935,0.8158,0.855],[0.2097,0.8137,0.8514],[0.2258,0.8107,0.8484],[0.2419,0.8071,0.8455],[0.2581,0.803,0.8424],[0.2742,0.7996,0.8386],[0.2903,0.7933,0.8354],[0.3065,0.7863,0.8314],[0.3226,0.7809,0.827],[0.3387,0.7783,0.8227],[0.3548,0.7775,0.8174],[0.371,0.7745,0.8117],[0.3871,0.7701,0.806],[0.4032,0.7656,0.8003],[0.4194,0.7603,0.7952],[0.4355,0.7541,0.7917],[0.4516,0.7433,0.789],[0.4677,0.7307,0.7857],[0.4839,0.7234,0.7812],[0.5,0.7194,0.7772],[0.5161,0.7143,0.7728],[0.5323,0.7077,0.7664],[0.5484,0.7018,0.7595],[0.5645,0.6953,0.7526],[0.5806,0.6895,0.7451],[0.5968,0.686,0.7377],[0.6129,0.6823,0.7303],[0.629,0.6772,0.7236],[0.6452,0.6728,0.7174],[0.6613,0.6688,0.7121],[0.6774,0.6637,0.7077],[0.6935,0.6576,0.7033],[0.7097,0.6525,0.6991],[0.7258,0.6473,0.695],[0.7419,0.6409,0.691],[0.7581,0.6358,0.686],[0.7742,0.6311,0.6826],[0.7903,0.6254,0.6808],[0.8065,0.6188,0.6789],[0.8226,0.6107,0.6761],[0.8387,0.6006,0.6722],[0.8548,0.5901,0.6675],[0.871,0.5812,0.6602],[0.8871,0.5743,0.6501],[0.9032,0.568,0.64],[0.9194,0.5621,0.6315],[0.9355,0.5514,0.6237],[0.9516,0.5437,0.6181],[0.9677,0.5418,0.6102],[0.9839,0.5382,0.6027],[1.0,0.5355,0.5994]];
  const R = 5;           // dot radius, px
  const TAIL = 1.6;      // s of trail
  const ACROSS = 55;     // px/s across the river, at a 800px-tall frame
  const DOWN = 22;       // px/s downstream, at a 800px-tall frame

  const img = new Image();
  img.decoding = 'async';
  let W = 0, H = 0, dpr = 1, view = null;
  let dot = null, trail = [], last = 0, running = false, visible = false;

  // Where the image sits in the frame: covering it, kept to the river side
  // on wide screens; on tall screens the camera pans with the dot.
  function build() {
    const r = viz.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    viz.width = Math.round(W * dpr); viz.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const k = Math.max(W / IMG_W, H / IMG_H);
    view = { k, w: IMG_W * k, h: IMG_H * k, x: (W - IMG_W * k) * 0.8, y: (H - IMG_H * k) / 2 };
    if (img.complete && img.naturalWidth) draw();
  }
  img.addEventListener('load', () => draw());

  // The banks at image row y (image px), as image x.
  function banksAt(yImg) {
    const f = Math.min(1, Math.max(0, yImg / IMG_H));
    let i = 1;
    while (i < BANKS.length - 1 && BANKS[i][0] < f) i++;
    const a = BANKS[i - 1], b = BANKS[i], u = (f - a[0]) / ((b[0] - a[0]) || 1);
    return [(a[1] + (b[1] - a[1]) * u) * IMG_W, (a[2] + (b[2] - a[2]) * u) * IMG_W];
  }

  // The dot lives in image coordinates, so it stays on the river whatever
  // the frame does.
  const start = () => { const [l, r] = banksAt(0); dot = { x: (l + r) / 2, y: -R * 3 / view.k, dir: 1 }; trail = []; };

  function step(dt) {
    const s = H / 800 / view.k;                   // frame px/s → image px/s
    dot.y += DOWN * s * dt;
    dot.x += dot.dir * ACROSS * s * dt;
    const [l, r] = banksAt(dot.y);
    const pad = (R + 2) / view.k;
    if (dot.x > r - pad) { dot.x = r - pad; dot.dir = -1; }
    if (dot.x < l + pad) { dot.x = l + pad; dot.dir = 1; }
    if (dot.y * view.k + view.y > H + R * 4) start();   // off the bottom: back to the top
  }

  // On tall screens the river doesn't fit across, so follow the dot sideways.
  function pan() {
    if (view.w - W < 1 || W > H * 1.1) return;
    const want = W * 0.55 - dot.x * view.k;
    view.x = Math.min(0, Math.max(W - view.w, view.x + (want - view.x) * 0.04));
  }

  function draw(now = 0) {
    ctx.clearRect(0, 0, W, H);
    if (img.complete && img.naturalWidth) ctx.drawImage(img, view.x, view.y, view.w, view.h);
    // A light veil, so the red reads and the frame sits with the dark page.
    ctx.fillStyle = 'rgba(14, 18, 23, 0.28)';
    ctx.fillRect(0, 0, W, H);
    if (!dot) return;
    const sx = (x) => view.x + x * view.k, sy = (y) => view.y + y * view.k;
    ctx.save();
    ctx.strokeStyle = RED;
    ctx.shadowColor = RED;
    ctx.shadowBlur = 8;
    ctx.lineCap = 'round';
    for (let i = 1; i < trail.length; i++) {
      const age = (now - trail[i].t) / TAIL;
      if (age >= 1) continue;
      ctx.globalAlpha = 0.75 * (1 - age);
      ctx.lineWidth = 4 * (1 - age) + 0.5;
      ctx.beginPath();
      ctx.moveTo(sx(trail[i - 1].x), sy(trail[i - 1].y));
      ctx.lineTo(sx(trail[i].x), sy(trail[i].y));
      ctx.stroke();
    }
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = RED;
    ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(sx(dot.x), sy(dot.y), R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function frame(ms) {
    if (!running) return;
    const now = ms / 1000;
    const dt = last ? Math.min(0.05, now - last) : 0;
    last = now;
    if (!dot) start();
    step(dt);
    pan();
    trail.push({ x: dot.x, y: dot.y, t: now });
    while (trail.length && now - trail[0].t > TAIL) trail.shift();
    draw(now);
    requestAnimationFrame(frame);
  }

  function update() {
    const play = visible && !reduceMotion.matches;
    if (play && !running) {
      running = true; last = 0;
      if (!img.src) img.src = W * dpr > 1300 ? 'assets/maps/river-search-1960.jpg' : 'assets/maps/river-search-1200.jpg';
      requestAnimationFrame(frame);
    }
    if (!play) {
      running = false;
      if (reduceMotion.matches && visible) {
        if (!img.src) img.src = 'assets/maps/river-search-1200.jpg';
        const [l, r] = banksAt(IMG_H * 0.4);
        dot = { x: (l + r) / 2, y: IMG_H * 0.4, dir: 1 }; trail = [];
        draw();
      }
    }
  }

  build();
  new ResizeObserver(() => { build(); trail = []; }).observe(viz);
  reduceMotion.addEventListener('change', update);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }, { rootMargin: '200px 0px' }).observe(viz);
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

// ---------- Route zoom (M4 → M5) ----------
// The route cards drive one camera in two moves: the first card shows the
// overview, the second settles partway in (the river from St. Paul down past
// the falls to the flats), the third lands on the close-up. Each card says
// where it wants the camera with data-zoom (0 = overview, 1 = close-up). The close-up and a sharp
// tile of the overview sit over their own ground inside one layer (see the
// CSS), so moving that one layer keeps everything in register. The zoom runs
// at a steady rate on a log scale (how zooming feels natural), easing in and
// out; the sharp tile fades in first (and with it the
// overview's pin goes, as map labels do when you zoom), then the close-up.
// Scrolling back zooms back out the same way. Add ?zoomAt=0.4 to freeze it
// partway, for checking.

const zoom = document.querySelector('.zoom');
const zoomCards = zoom ? [...zoom.closest('.stage').querySelectorAll('.card[data-zoom]')] : [];
if (zoom && zoomCards.length) {
  const world = zoom.querySelector('.zoom__world');
  const AR = 2400 / 1454;                       // the overview's shape
  const CLOSE = { x: 0.65456, y: 0.72516, w: 0.07922, h: 0.07998 }; // close-up footprint
  const FEATHER = 0.1;                          // matches the mask in the CSS
  // Seconds for a move: longer the further it goes on the zoom scale.
  const durationFor = (d) => 0.9 + 2 * Math.abs(d);
  const frozen = parseFloat(new URLSearchParams(location.search).get('zoomAt'));

  // e: where the camera is, 0–1 on a log scale of zoom. A move eases from
  // where the camera is to where it's going.
  let geo = null, e = 0, target = 0, move = null, raf = 0;

  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  function measure() {
    const fw = zoom.clientWidth, fh = zoom.clientHeight;
    const tall = fw / fh <= 6 / 5;
    // Start: the overview fills the frame (whole map on tall screens).
    const W = tall ? Math.min(fw, fh * AR) : Math.max(fw, fh * AR), H = W / AR;
    const b0 = [(fw - W) / 2, (fh - H) / 2];
    // End: the close-up, less its soft edges, fills the frame (kept around
    // its label on tall screens).
    const cw = CLOSE.w * W * (1 - 2 * FEATHER), ch = CLOSE.h * H * (1 - 2 * FEATHER);
    const cx = (CLOSE.x + CLOSE.w * FEATHER) * W, cy = (CLOSE.y + CLOSE.h * FEATHER) * H;
    // On tall screens fit the close-up's full height (its soft top and bottom
    // edges then melt into the blurred overview), so it isn't pushed in so
    // far that the cul-de-sacs around the falls leave the frame.
    const k = tall ? 1.2 * Math.max(fw / cw, fh / (CLOSE.h * H)) : Math.max(fw / cw, fh / ch);
    // Centre the falls (label and dot) where the frame allows, never showing
    // past the close-up's sharp area.
    const fx = (CLOSE.x + CLOSE.w * 0.665) * W, fy = (CLOSE.y + CLOSE.h * 0.58) * H;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const b1 = [
      clamp(fw / 2 - k * fx, fw - k * (cx + cw), -k * cx),
      // On tall screens the cards cover the lower half, so the falls sit in
      // the upper third; the close-up's soft lower edge goes under the card.
      tall ? fh * 0.36 - k * fy : clamp(fh / 2 - k * fy, fh - k * (cy + ch), -k * cy),
    ];
    // Where the falls are on screen at the start and at the end.
    const S0 = [b0[0] + fx, b0[1] + fy], S1 = [b1[0] + k * fx, b1[1] + k * fy];
    world.style.width = `${W}px`;
    world.style.height = `${H}px`;
    geo = { k, fall: [fx, fy], S0, S1 };
  }

  function render() {
    if (!geo) return;
    const z = geo.k ** e;
    // The camera keeps the falls in view: the first move (to the halfway
    // stop) brings them to where they'll end up on screen while zooming; the
    // second pushes straight in on them.
    const g = smooth(0, 0.36, e);
    const tx = geo.S0[0] + (geo.S1[0] - geo.S0[0]) * g - z * geo.fall[0];
    const ty = geo.S0[1] + (geo.S1[1] - geo.S0[1]) * g - z * geo.fall[1];
    world.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${z.toFixed(5)})`;
    zoom.style.setProperty('--detail', smooth(0.46, 0.58, e).toFixed(3));
    zoom.style.setProperty('--close', smooth(0.6, 0.88, e).toFixed(3));
    // A touch of softness on the overview as it's pushed past its own
    // resolution, like motion blur, so its pixels never show.
    // Blur in the layer's own pixels, so divide by the zoom: about 4px on
    // screen, like a shallow depth of field around the sharp close-up.
    zoom.style.setProperty('--soft', `${(smooth(0.56, 0.8, e) * 4 / z).toFixed(3)}px`);
    // The close-up is brighter and less saturated than the overview: it
    // arrives tinted to match, then eases back to its own colours as it lands.
    const own = smooth(0.72, 1, e);
    zoom.style.setProperty('--cbri', (0.68 + 0.32 * own).toFixed(3));
    zoom.style.setProperty('--csat', (1.5 - 0.5 * own).toFixed(3));
  }

  function tick(ms) {
    if (!move.start) move.start = ms;
    const t = Math.min(1, (ms - move.start) / 1000 / move.dur);
    e = move.from + (move.to - move.from) * ease(t);
    render();
    if (t < 1) raf = requestAnimationFrame(tick);
    else { raf = 0; move = null; world.style.willChange = 'auto'; } // re-draw sharp at rest
  }

  function go(to) {
    if (!Number.isNaN(frozen) || to === target) return;
    target = to;
    if (reduceMotion.matches) {
      zoom.classList.add('is-swapping');
      setTimeout(() => { e = target; render(); zoom.classList.remove('is-swapping'); }, 300);
      return;
    }
    // A new move starts from wherever the camera is, even mid-move.
    move = { from: e, to, dur: durationFor(to - e), start: 0 };
    world.style.willChange = 'transform';
    if (!raf) raf = requestAnimationFrame(tick);
  }

  zoom.classList.add('is-live');
  measure();
  if (!Number.isNaN(frozen)) e = target = Math.min(1, Math.max(0, frozen));
  render();
  new ResizeObserver(() => { measure(); render(); }).observe(zoom);

  // The camera goes where the last card past the trigger line (two thirds
  // of the way down the screen) asks; above the first card, the overview.
  // Checked from positions on every scroll, so a jump (Home, a link, a fast
  // fling) can't leave it at the wrong stop.
  let queued = false;
  const settle = () => {
    queued = false;
    const line = window.innerHeight * 0.67;
    let to = 0;
    zoomCards.forEach((card) => {
      if (card.getBoundingClientRect().top < line) to = parseFloat(card.dataset.zoom);
    });
    go(to);
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(settle); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  settle();
}

// ---------- Share ----------
// Opens the device's share sheet where there is one (phones, most laptops);
// otherwise copies the link and says so: in the status line under the end
// button, or on the cover by turning the button's icon into a tick.

const shareBtns = document.querySelectorAll('[data-share]');
if (shareBtns.length) {
  const status = document.querySelector('.share__status');
  const canonical = document.querySelector('link[rel="canonical"]');
  const url = canonical ? canonical.href : location.href.split(/[?#]/)[0];
  const data = { title: document.title, text: 'It’s called Ivy Falls, and it isn’t found on any maps.', url };
  let timer = 0;
  const say = (btn, msg, done) => {
    clearTimeout(timer);
    if (btn.classList.contains('cover__share')) {
      btn.classList.toggle('is-done', done);
      btn.setAttribute('aria-label', msg);
      timer = setTimeout(() => { btn.classList.remove('is-done'); btn.setAttribute('aria-label', 'Share this story'); }, 2500);
    } else if (status) {
      status.textContent = msg;
      timer = setTimeout(() => { status.textContent = ''; }, 3500);
    }
  };
  shareBtns.forEach((btn) => btn.addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share(data); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      say(btn, 'Link copied', true);
    } catch {
      say(btn, url, false); // last resort: show the link to copy by hand
    }
  }));
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
