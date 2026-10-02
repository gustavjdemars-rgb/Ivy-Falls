// Ivy Falls: page-level behaviour. Phase 2 covers only the neatline rail
// (scroll progress) and the frame's colour over dark sections.

const rail = document.querySelector('.neatline__rail');

// The rail spans one quadrangle side, 7′30″ of latitude: 15 ticks at 30″,
// with a major tick every 2′30″. Ticks are evenly spaced; their count, not
// their labels, is what reports progress.
const INTERVALS = 15;
const MAJOR_EVERY = 5;

function buildRail() {
  if (!rail) return [];
  const ticks = [];
  for (let i = 0; i <= INTERVALS; i++) {
    const tick = document.createElement('span');
    tick.className = 'tick' + (i % MAJOR_EVERY === 0 ? ' tick--major' : '');
    tick.style.top = `${(i / INTERVALS) * 100}%`;
    rail.append(tick);
    ticks.push(tick);
  }
  for (const end of ['top', 'bottom']) {
    const label = document.createElement('span');
    label.className = `neatline__label neatline__label--${end}`;
    label.textContent = rail.dataset[end === 'top' ? 'latTop' : 'latBottom'];
    rail.append(label);
  }
  const index = document.createElement('span');
  index.className = 'neatline__index';
  rail.append(index);
  return { ticks, index };
}

const { ticks = [], index } = buildRail() || {};

let queued = false;
function updateProgress() {
  queued = false;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  if (index) index.style.top = `${p * 100}%`;
  ticks.forEach((tick, i) => tick.classList.toggle('is-passed', i / INTERVALS <= p));
}

function requestUpdate() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(updateProgress);
  }
}

window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', requestUpdate);
updateProgress();

// Switch the frame to its light variant while a dark section fills the middle of the screen.
const nights = document.querySelectorAll('.night');
if (nights.length && 'IntersectionObserver' in window) {
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target);
      else visible.delete(e.target);
    }
    document.documentElement.classList.toggle('on-night', visible.size > 0);
  }, { rootMargin: '-45% 0px -45% 0px' });
  nights.forEach((n) => io.observe(n));
}
