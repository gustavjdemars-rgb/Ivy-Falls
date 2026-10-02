// Ivy Falls: page-level behaviour. Phase 2 covers the cover (question-mark
// stream, falling byline board), weathered paper edges, the photo deck and the
// reading-progress bar.

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
// Marks fall from the top of the page onto the "h" of "The", flow right along
// the top of the line, drop off its end (onto a lower line if one sticks out
// further, like a tiered fall), land on the bottom of the cover and keep
// flowing right until they leave the screen.

const cover = document.querySelector('.cover');
const stream = document.querySelector('.qstream');
const title = document.querySelector('.cover__title');

const GRAVITY = 1700;     // px/s²
const STEP = 1 / 30;      // simulation step, s
const SPAWN_EVERY = 0.16; // s between marks

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
  // The bottom of the cover is a floor that runs off the right of the screen.
  ledges.push({ y: c.height - 2, left: -Infinity, right: Infinity, floor: true });

  // The white rule under the title follows the title's widest line.
  const widest = Math.max(...lines.map((l) => l.right - l.left));
  cover.style.setProperty('--title-w', `${Math.round(widest)}px`);

  // Where the stream lands: the "h" of "The".
  let dropX = ledges[0].left + fs * 0.6;
  let dropW = fs * 0.4;
  const text = title.firstChild;
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
    lineWidth: ledges[0].right - ledges[0].left,
    markSize,
  };
}

// Simulate one mark and return its path as [x, y, rotation] samples.
function simulate(g, rand) {
  const flow = g.lineWidth * (0.14 + rand() * 0.1); // slow, like water finding the edge
  const floorFlow = Math.max(flow * 1.5, 90);
  const bob = g.markSize * 0.14;                    // how far marks bob on the surface
  const phase = rand() * Math.PI * 2;
  let x = g.dropX + (rand() - 0.5) * g.dropW * 0.6;
  let y = -g.markSize * 1.5;
  let vx = 0;
  let vy = rand() * 60;
  let rot = (rand() - 0.5) * 30;
  const spin = (rand() - 0.5) * 360;
  let ledge = null;
  let t = 0;
  const path = [];

  while (path.length < 1500) {
    path.push([x, y, rot]);
    if (x > g.width + g.markSize * 2 || y > g.height + g.markSize * 2) break;
    t += STEP;
    if (ledge) {
      const target = ledge.floor ? floorFlow : flow;
      vx += (target - vx) * Math.min(1, STEP * 4);
      x += vx * STEP;
      // Bob on the surface like something floating.
      y = ledge.y - (0.5 + 0.5 * Math.sin(t * 6.5 + phase)) * bob;
      rot = Math.sin(t * 5 + phase) * 8;
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
  return path;
}

function makeMark(rand) {
  const q = document.createElement('span');
  q.className = 'qmark';
  q.textContent = '?';
  q.style.setProperty('--s', (0.7 + rand() * 0.8).toFixed(2));
  q.style.setProperty('--w', String(600 + Math.floor(rand() * 4) * 100)); // 600–900
  if (rand() < 0.45) q.style.setProperty('--c', 'var(--blue-deep)');
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
  for (let i = 0; i < path.length; i += 4) {
    const q = makeMark(rand);
    q.style.transform = place(path[i]);
    stream.append(q);
  }
}

let running = false;
let coverVisible = true;
let last = 0;
let carry = 0;

function tick(now) {
  if (!running) return;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (coverVisible && !document.hidden) {
    carry += dt;
    while (carry >= SPAWN_EVERY) {
      carry -= SPAWN_EVERY;
      launch(Math.random);
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

// ---------- Byline: the board falls ----------
//
// On hover, click or tap: the right nail pops out and the board swings down
// from the left nail, swaying for about three seconds. Then the left nail
// pops, the board drops to the bottom of the cover and cracks in two. The
// nails land there too. READ MORE is left where the board was. Once only.

const byline = document.querySelector('.byline');
const board = byline && byline.querySelector('.tape--byline');
const readMore = byline && byline.querySelector('.readmore');

const NAIL_SVG = '<svg viewBox="0 0 8 20" width="8" height="20" aria-hidden="true"><rect x="3" y="4" width="2" height="15" rx="1" fill="#77776F"/><ellipse cx="4" cy="3.5" rx="4" ry="2.4" fill="#B7B7B2"/><ellipse cx="3.3" cy="3" rx="1.6" ry="0.9" fill="#EEEEEA"/></svg>';

// A nail pops out at the given point (cover coordinates) and falls to the floor.
function dropNail(nailEl) {
  const c = cover.getBoundingClientRect();
  const r = nailEl.getBoundingClientRect();
  nailEl.style.visibility = 'hidden';
  const x = r.left + r.width / 2 - c.left;
  const y = r.top + r.height / 2 - c.top;
  const nail = document.createElement('span');
  nail.className = 'loose-nail';
  nail.innerHTML = NAIL_SVG;
  nail.style.left = `${x - 4}px`;
  nail.style.top = `${y - 10}px`;
  cover.append(nail);

  const dy = c.height - 4 - y;
  const drift = 10 + Math.random() * 14;
  const spin = 250 + Math.random() * 60;
  const anim = nail.animate([
    { transform: 'translate(0, 0) rotate(0deg)', easing: 'ease-out' },
    { transform: `translate(${drift * 0.3}px, -12px) rotate(50deg)`, offset: 0.14, easing: 'cubic-bezier(.5, 0, 1, .6)' },
    { transform: `translate(${drift}px, ${dy}px) rotate(${spin}deg)`, offset: 0.82, easing: 'ease-out' },
    { transform: `translate(${drift + 3}px, ${dy - 7}px) rotate(${spin + 10}deg)`, offset: 0.9, easing: 'ease-in' },
    { transform: `translate(${drift + 4}px, ${dy}px) rotate(270deg)` },
  ], { duration: 600 + Math.sqrt(Math.max(dy, 0)) * 22, fill: 'forwards' });
  anim.onfinish = () => {
    // Rest on the floor so it stays there if the cover is resized.
    anim.cancel();
    nail.style.top = 'auto';
    nail.style.bottom = '0';
    nail.style.left = `${x - 4 + drift + 4}px`;
    nail.style.transform = 'rotate(270deg)';
  };
}

let restingTransform = null;

function boardRestPosition() {
  const c = cover.getBoundingClientRect();
  const b = byline.getBoundingClientRect();
  const w = board.offsetWidth;
  const h = board.offsetHeight;
  const pivotX = board.querySelector('.nail--l').offsetLeft + board.querySelector('.nail--l').offsetWidth / 2;
  const dx = pivotX - w / 2;
  const dy = c.bottom - b.top - h - 1;
  return { dx, dy, pivotX, h };
}

function crackBoard({ dx, dy, pivotX, h }) {
  const crack = document.createElement('div');
  crack.className = 'crack';
  crack.inert = true;
  crack.setAttribute('aria-hidden', 'true');
  crack.style.transformOrigin = `${pivotX}px ${h / 2}px`;
  restingTransform = `translate(${dx}px, ${dy}px) rotate(-1.5deg)`;
  crack.style.transform = restingTransform;

  const halves = ['l', 'r'].map((side) => {
    const half = document.createElement('div');
    half.className = `crack__half crack__half--${side}`;
    const copy = board.cloneNode(true);
    copy.removeAttribute('style');
    copy.tabIndex = -1;
    copy.querySelectorAll('.nail').forEach((n) => { n.style.visibility = 'hidden'; });
    half.append(copy);
    crack.append(half);
    return half;
  });
  byline.append(crack);
  board.style.visibility = 'hidden';

  if (!reduceMotion.matches) {
    halves[0].animate([
      { transform: 'none' },
      { transform: 'translate(-3px, -5px) rotate(-3deg)', offset: 0.35 },
      { transform: 'translate(-5px, 0) rotate(-2deg)' },
    ], { duration: 380, easing: 'ease-out', fill: 'forwards' });
    halves[1].animate([
      { transform: 'none' },
      { transform: 'translate(4px, -6px) rotate(4deg)', offset: 0.35 },
      { transform: 'translate(6px, 0) rotate(3deg)' },
    ], { duration: 380, easing: 'ease-out', fill: 'forwards' });
  } else {
    halves[0].style.transform = 'translate(-5px, 0) rotate(-2deg)';
    halves[1].style.transform = 'translate(6px, 0) rotate(3deg)';
  }
}

function dropBoard(fromKeyboard) {
  if (!board || byline.classList.contains('is-revealed')) return;
  byline.classList.add('is-revealed');
  readMore.inert = false;
  const done = () => { if (fromKeyboard) readMore.focus(); };

  if (reduceMotion.matches) {
    crackBoard(boardRestPosition());
    done();
    return;
  }

  const rest = boardRestPosition();
  const tilt = parseFloat(getComputedStyle(board).getPropertyValue('--tilt')) || 0;
  board.style.transformOrigin = `${rest.pivotX}px 50%`;

  dropNail(board.querySelector('.nail--r'));

  // A damped swing around the left nail, about three seconds, nearly stopping.
  const angles = [tilt, 90, 57, 118, 69, 107, 78, 99, 84, 95, 87.5, 91.5, 88.6];
  const swing = board.animate(angles.map((a, i) => ({
    transform: `rotate(${a}deg)`,
    offset: i === 0 ? 0 : 0.1 + (0.9 * (i - 1)) / (angles.length - 2),
    easing: i === 0 ? 'cubic-bezier(.5, 0, .9, .6)' : 'ease-in-out',
  })), { duration: 3200, fill: 'forwards' });

  swing.onfinish = () => {
    dropNail(board.querySelector('.nail--l'));
    const fall = board.animate([
      { transform: 'translate(0, 0) rotate(88.6deg)' },
      { transform: `translate(${rest.dx * 0.35}px, ${rest.dy * 0.3}px) rotate(70deg)`, offset: 0.45 },
      { transform: `translate(${rest.dx}px, ${rest.dy}px) rotate(-1.5deg)` },
    ], { duration: 650, easing: 'cubic-bezier(.5, 0, .9, .5)', fill: 'forwards' });
    fall.onfinish = () => {
      crackBoard(boardRestPosition());
      fall.cancel();
      done();
    };
  };
}

if (byline && board && readMore) {
  byline.addEventListener('mouseenter', () => dropBoard(false));
  board.addEventListener('click', (e) => dropBoard(e.detail === 0));
  // Keep the broken board on the floor if the cover changes height.
  window.addEventListener('resize', () => {
    const crack = byline.querySelector('.crack');
    if (!crack) return;
    const { dx, dy } = boardRestPosition();
    crack.style.transform = `translate(${dx}px, ${dy}px) rotate(-1.5deg)`;
  });
}

// ---------- Weathered paper ----------
//
// Sparingly, sheets, cards and clippings get a torn corner or two and a few
// tiny nicks along an edge. Applied as a clip-path on the paper layer only.

function tatter(rand) {
  const pt = (xp, xpx, yp, ypx) => `calc(${xp}% + ${xpx.toFixed(1)}px) calc(${yp}% + ${ypx.toFixed(1)}px)`;
  let torn = 0;
  const corner = (cx, cy) => {
    // cx, cy: 0 or 1 (left/right, top/bottom). Returns points in clockwise order.
    const sx = cx ? -1 : 1;
    const sy = cy ? -1 : 1;
    const X = cx * 100;
    const Y = cy * 100;
    if (torn >= 2 || rand() > 0.3) return [pt(X, 0, Y, 0)];
    torn++;
    const a = 5 + rand() * 10;   // along the horizontal edge
    const b = 5 + rand() * 10;   // along the vertical edge
    const mid = pt(X, sx * a * (0.35 + rand() * 0.3), Y, sy * b * (0.3 + rand() * 0.35));
    const onH = pt(X, sx * a, Y, 0);
    const onV = pt(X, 0, Y, sy * b);
    // Clockwise: TL goes V→H, TR goes H→V, BR goes V→H, BL goes H→V.
    return (cx === cy) ? [onV, mid, onH] : [onH, mid, onV];
  };
  const nicks = (fixed, along, reverse) => {
    if (rand() > 0.5) return [];
    const out = [];
    const count = 1 + Math.floor(rand() * 2);
    const ts = Array.from({ length: count }, () => 15 + rand() * 70).sort((p, q) => (reverse ? q - p : p - q));
    for (const t of ts) {
      const depth = 1 + rand() * 2;
      for (const [dt, d] of [[-1.2, 0], [0, depth], [1.2, 0]]) {
        const tt = reverse ? t - dt : t + dt;
        out.push(along(tt, d));
      }
    }
    return out;
  };
  return 'polygon(' + [
    ...corner(0, 0),
    ...nicks(0, (t, d) => pt(t, 0, 0, d)),
    ...corner(1, 0),
    ...nicks(100, (t, d) => pt(100, -d, t, 0)),
    ...corner(1, 1),
    ...nicks(100, (t, d) => pt(t, 0, 100, -d), true),
    ...corner(0, 1),
    ...nicks(0, (t, d) => pt(0, d, t, 0), true),
  ].join(', ') + ')';
}

{
  const rand = mulberry32(37);
  document.querySelectorAll('.sheet, .card, .clipping__paper').forEach((el) => {
    if (rand() < 0.45) return; // most stay crisp
    el.style.setProperty('--tatter', tatter(rand));
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

  deck.querySelector('.deck__arrow--prev').addEventListener('click', () => rotate(-1));
  deck.querySelector('.deck__arrow--next').addEventListener('click', () => rotate(1));
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); rotate(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); rotate(1); }
  });
  // Clicking a side card brings it to the middle.
  cards.forEach((card, i) => card.addEventListener('click', () => {
    const pos = posOf(i);
    if (pos) rotate(-Math.sign(pos));
  }));

  layout();
  window.addEventListener('resize', () => layout());
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
