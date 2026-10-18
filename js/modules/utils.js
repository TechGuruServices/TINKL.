// Utils + cross-section state services — U from legacy.js lines 143-188;
// loadAll (324-335), repairLogs (337-363), saveSettings (575), setActive (576)
// live here as named exports (they need DB + S, which utils may import).

import { DB } from './db.js';
import { S } from './state.js';

/* ================ Utils ================ */
const U = {
  id: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
  esc(s) { if (s == null) return ''; const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; },
  fmtTime(d) { return new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); },
  fmtDate(d, o = { month: 'short', day: 'numeric' }) { return new Date(d).toLocaleDateString([], o); },
  rel(d) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  },
  greet() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; },
  isToday(d) { return new Date(d).toDateString() === new Date().toDateString(); },
  today(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; },
  // Guards every numeric display against undefined/null/blank/non-numeric
  // input turning into NaN on screen (e.g. corrupted records, cleared
  // inputs, bad cloud-restore data). Never throws, always returns a number.
  safeNum(val, fallback = 0) {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    return Number.isFinite(n) ? n : fallback;
  },
  // Weights can be logged in kg or lbs per-entry; everything that
  // compares/plots multiple entries together must normalize to a single
  // source of truth first (kg) or the numbers are meaningless.
  toKg(value, unit) { const n = U.safeNum(value); return unit === 'lbs' ? n / 2.20462 : n; },
  kgToLbs(kg) { return U.safeNum(kg) * 2.20462; },
  fmtWeight(kg, unit) { return unit === 'lbs' ? (U.kgToLbs(kg)).toFixed(1) + ' lbs' : U.safeNum(kg).toFixed(1) + ' kg'; },
  toast(m, t = 'info') {
    const w = document.getElementById('toastWrap');
    const e = document.createElement('div');
    e.className = 'toast ' + t; e.textContent = m;
    w.appendChild(e);
    setTimeout(() => { e.style.transition = 'all .3s'; e.style.opacity = 0; e.style.transform = 'translateX(120%)'; setTimeout(() => e.remove(), 300); }, 3200);
  },
  confirm(title, msg) {
    // NOTE: openModal is resolved via dynamic import so utils.js keeps no
    // static import of modal.js (which itself imports U from here) — this
    // breaks what would otherwise be a utils <-> modal import cycle.
    // Observable behavior is unchanged: confirm() still returns a Promise
    // that resolves with the user's choice.
    return import('./modal.js').then(({ openModal }) => new Promise((res) => {
      openModal({
        title, body: `<p class="text-mut">${U.esc(msg)}</p>`,
        actions: [{ label: 'Cancel', kind: 'secondary', v: false }, { label: 'Confirm', kind: 'danger', v: true }],
        onAction: (v, close) => { close(); res(v); }
      });
    }));
  }
};

async function loadAll() {
  const [pets, logs, reminders, weights, meds, vaccinations, notes] = await Promise.all([
    DB.all('pets'), DB.all('logs'), DB.all('reminders'), DB.all('weights'),
    DB.all('meds'), DB.all('vaccinations'), DB.all('notes')
  ]);
  Object.assign(S, { pets, logs: await repairLogs(logs), reminders, weights, meds, vaccinations, notes });
  const s = localStorage.getItem('tinkl_settings');
  if (s) S.settings = Object.assign(S.settings, JSON.parse(s));
  if (!S.activePetId && pets.length) S.activePetId = pets[0].id;
  const ap = localStorage.getItem('tinkl_active');
  if (ap && pets.find(p => p.id === ap)) S.activePetId = ap;
}

/**
 * One-time self-heal for logs written before a fixed bug where reminder
 * "✅ Done" completions stored the timestamp as `at` instead of `ts`.
 * Those records have `ts === undefined`, which turns any stat computed
 * from timestamp arithmetic (Avg interval, streaks, trend chart) into
 * NaN — a single bad record poisons the whole average. Runs once per
 * load; only writes back to IndexedDB when a record actually needed it,
 * so this is a no-op after the first pass on a given device.
 */
async function repairLogs(logs) {
  const fixes = [];
  for (const log of logs) {
    if (Number.isFinite(log.ts)) continue;
    if (Number.isFinite(log.at)) {
      log.ts = log.at;
      delete log.at;
    } else {
      log.ts = Date.now();
    }
    fixes.push(log);
  }
  if (fixes.length) {
    await Promise.all(fixes.map(log => DB.put('logs', log)));
    console.warn(`[TINKL] Repaired ${fixes.length} log record(s) with a missing/invalid timestamp.`);
  }
  return logs;
}

function saveSettings() { localStorage.setItem('tinkl_settings', JSON.stringify(S.settings)); }

function setActive(id) { S.activePetId = id; localStorage.setItem('tinkl_active', id); }

export { U, loadAll, repairLogs, saveSettings, setActive };
