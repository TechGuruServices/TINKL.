/* ============================================================================
 * views/household.js — "All pets" household comparison view.
 *
 * Imports ONLY { S } from '../state.js' and { analyzePet } from
 * '../healthRadar.js' (the guaranteed contracts). All helpers are
 * self-contained below.
 *
 * Renders into #view-household:
 *   - per pet: today's counts for each key log type
 *   - per pet: active Health Radar alert count (analyzePet)
 *   - per pet: weight sparkline (inline SVG, last 12 weights, kg-normalized)
 * Zero pets -> graceful empty state.
 * ========================================================================== */

import { S } from '../state.js';
import { analyzePet } from '../healthRadar.js';

const KEY_TYPES = ['pee', 'poop', 'feed', 'water', 'walk', 'med', 'accident'];
const TYPE_LABEL = {
  pee: 'Pee', poop: 'Poop', feed: 'Feed', water: 'Water',
  walk: 'Walk', med: 'Meds', accident: 'Accidents',
};
const TYPE_EMOJI = {
  pee: '💧', poop: '💩', feed: '🍽', water: '💦',
  walk: '🚶', med: '💊', accident: '⚠️',
};

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function toKg(value, unit) {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return 0;
  return unit === 'lbs' ? n / 2.20462 : n;
}

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Inline SVG sparkline for up to 12 weight points (kg). Self-contained. */
function sparkline(weights) {
  const pts = weights.slice(-12);
  const W = 132, H = 40, P = 4;
  if (!pts.length) {
    return `<div class="hh-spark-empty">No weights yet</div>`;
  }
  const kg = pts.map(w => toKg(w.value, w.unit));
  const min = Math.min(...kg), max = Math.max(...kg);
  const span = max - min || 1;
  const coords = kg.map((v, i) => {
    const x = pts.length === 1 ? W / 2 : P + (i / (pts.length - 1)) * (W - 2 * P);
    const y = P + (1 - (v - min) / span) * (H - 2 * P);
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  });
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const [lx, ly] = coords[coords.length - 1];
  const latest = kg[kg.length - 1];
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Weight trend">
    <polyline points="${line}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${lx}" cy="${ly}" r="3" fill="currentColor"/>
    <text x="${W - P}" y="${P + 10}" text-anchor="end" font-size="9" fill="currentColor" opacity="0.75">${latest.toFixed(1)} kg</text>
  </svg>`;
}

function petCard(pet, now) {
  const plogs = S.logs.filter(l => l && l.petId === pet.id && typeof l.ts === 'number');
  const dayStart = startOfDay(now);
  const today = plogs.filter(l => l.ts >= dayStart);
  const counts = KEY_TYPES.map(t => ({
    t,
    n: today.filter(l => l.type === t).length,
  }));
  const flags = analyzePet(pet.id, S.logs, now);
  const urgent = flags.filter(f => f.severity === 'urgent').length;
  const weights = S.weights
    .filter(w => w && w.petId === pet.id && typeof w.ts === 'number')
    .sort((a, b) => a.ts - b.ts);

  const alertTag = flags.length
    ? `<span class="tag ${urgent ? 'due' : 'warn'}">${flags.length} alert${flags.length === 1 ? '' : 's'}${urgent ? ` · ${urgent} urgent` : ''}</span>`
    : `<span class="tag ok">All clear</span>`;

  const cells = counts.map(({ t, n }) =>
    `<div class="hh-cell"><div class="hh-emoji">${TYPE_EMOJI[t]}</div>` +
    `<div class="hh-num">${n}</div><div class="hh-lab">${TYPE_LABEL[t]}</div></div>`).join('');

  return `<div class="card hh-card">
    <div class="section-head margin-0-0-12">
      <div class="section-title">${esc(pet.name || 'Unnamed')}</div>
      ${alertTag}
    </div>
    <div class="hh-grid">${cells}</div>
    <div class="hh-spark-row">
      <div class="hh-spark-lab">Weight trend</div>
      <div class="hh-spark">${sparkline(weights)}</div>
    </div>
  </div>`;
}

export function renderHousehold() {
  const host = document.getElementById('view-household');
  if (!host) return;
  const now = Date.now();

  if (!S.pets.length) {
    host.innerHTML = `<div class="empty" style="padding:48px 8px">
      <div class="empty-ic">🏠</div>
      <div class="empty-title">No pets yet</div>
      <div class="empty-sub">Add your first pet to see the household overview.</div>
    </div>`;
    return;
  }

  host.innerHTML =
    `<div class="section-head"><div class="section-title">Household — all pets</div></div>` +
    S.pets.map(p => petCard(p, now)).join('');
}
