// Dashboard view — extracted from legacy.js lines 633-750.
// (The global document click delegation at legacy lines 751-762 moved to js/app.js.)

import { S } from '../state.js';
import { U, setActive } from '../utils.js';
import { Icon, GEmoji } from '../icons.js';
import { LOG_TYPES } from '../logTypes.js';
import { showPetSwitcher } from './pets.js';
import { openPetModal } from '../camera.js';
import { quickLog } from './quickLog.js';
import { getUpcomingAlarms } from '../reminders.js';
import { analyzePet } from '../healthRadar.js';

/* ================ Dashboard ================ */
function renderDashboard() {
  const active = S.pets.find(p => p.id === S.activePetId);
  const now = new Date();
  // Health Radar (differentiator): on-device anomaly flags for the active
  // pet, shown as a dismissible banner at the top of the dashboard.
  // analyzePet returns [] when the pet has < 7 days of history.
  document.getElementById('radarBanner')?.remove();
  const radarFlags = S.activePetId ? analyzePet(S.activePetId, S.logs) : [];
  if (radarFlags.length) {
    document.getElementById('view-dashboard')?.insertAdjacentHTML('afterbegin', `
    <div class="card mb-4" id="radarBanner" style="border-left:4px solid var(--gold)">
      <div class="section-head margin-0-0-12">
        <div class="section-title">🛰 Health Radar</div>
        <button class="icon-btn" id="radarDismiss" title="Dismiss" aria-label="Dismiss">✕</button>
      </div>
      ${radarFlags.map(f => `
        <div class="feed-item">
          <div class="feed-body">
            <div class="feed-title">${U.esc(f.title)}</div>
            <div class="feed-meta">${U.esc(f.detail)}</div>
          </div>
          <span class="tag ${f.severity === 'urgent' ? 'due' : f.severity === 'warn' ? 'warn' : 'ok'}">${U.esc(f.severity)}</span>
        </div>`).join('')}
    </div>`);
    document.getElementById('radarDismiss')?.addEventListener('click', () =>
      document.getElementById('radarBanner')?.remove());
  }
  document.getElementById('hero').innerHTML = `
<div class="hero-top">
  <div>
    <div class="hero-greet">${U.greet()}${active ? ', ' + U.esc(active.parent || 'friend') : ''}</div>
    <div class="hero-name">${active ? 'Hi, ' + U.esc(active.name) + '! ' + GEmoji('👋') : 'Welcome to TINKL'}</div>
    <div class="hero-date">${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
  </div>
</div>
${active ? `
  <div class="hero-pet">
    <div class="hero-pet-avatar">${active.photo ? `<img src="${active.photo}">` : Icon('paw')}</div>
    <div style="flex:1;min-width:0">
      <div class="hero-pet-name">${U.esc(active.name)}</div>
      <div class="hero-pet-meta">${U.esc(active.breed || 'Good boy')} · ${active.weight ? U.kgToLbs(active.weight).toFixed(1) + ' lbs' : 'Weight not set'}</div>
    </div>
    ${S.pets.length > 1 ? `<button class="icon-btn" id="switchPet" title="Switch pet">${Icon('refresh')}</button>` : ''}
  </div>
` : `
  <div style="margin-top:14px"><button class="btn btn-primary" id="firstPetBtn">+ Add your first pet</button></div>
`}
  `;
  const sp = document.getElementById('switchPet'); if (sp) sp.addEventListener('click', showPetSwitcher);
  const fp = document.getElementById('firstPetBtn'); if (fp) fp.addEventListener('click', () => openPetModal());

  // Stats
  const todayLogs = S.logs.filter(l => l.petId === S.activePetId && U.isToday(l.ts));
  const c = (type) => todayLogs.filter(l => l.type === type).length;
  const streak = computeStreak();
  document.getElementById('statsGrid').innerHTML = `
${statCard('ic-pee', 'droplet', 'Pee today', c('pee'), c('pee') ? 'last ' + shortLast('pee') : 'no logs')}
${statCard('ic-poop', 'poop', 'Poop today', c('poop'), c('poop') ? 'last ' + shortLast('poop') : 'no logs')}
${statCard('ic-food', 'bowl', 'Feed', c('feed'), c('feed') ? 'last ' + shortLast('feed') : 'not fed yet')}
${statCard('ic-walk', 'walking', 'Walks', c('walk'), c('walk') ? 'last ' + shortLast('walk') : 'no walks yet')}
${statCard('ic-streak', 'flame', 'Streak', streak, 'days logged')}
${statCard('ic-alert', 'alertTriangle', 'Accidents', c('accident'), 'today')}
  `;

  // Quick
  const quicks = ['pee', 'poop', 'feed', 'water', 'walk', 'med', 'play', 'accident'];
  document.getElementById('quickGrid').innerHTML = quicks.map(t => `
<button class="quick-btn" data-quick="${t}">
  <span class="q-ic ${LOG_TYPES[t].cls}">${Icon(LOG_TYPES[t].icon)}</span>
  ${LOG_TYPES[t].label}
</button>
  `).join('');
  document.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => quickLog(b.dataset.quick)));

  // Recent
  const recent = [...S.logs].filter(l => l.petId === S.activePetId).sort((a, b) => b.ts - a.ts).slice(0, 5);
  document.getElementById('recentFeed').innerHTML = recent.length ? recent.map(feedRow).join('') : emptyRow('No activity yet');

  // Upcoming
  const upcoming = getUpcomingAlarms(5);
  document.getElementById('upcomingFeed').innerHTML = upcoming.length ? upcoming.map(r => `
<div class="feed-item">
  <div class="feed-ic ${LOG_TYPES[r.logType]?.cls || 'ic-brand'}">${Icon(LOG_TYPES[r.logType]?.icon || 'alarm')}</div>
  <div class="feed-body">
    <div class="feed-title">${U.esc(r.title)}</div>
    <div class="feed-meta">${r.nextText}</div>
  </div>
</div>
  `).join('') : emptyRow('No reminders set');

  // Last of each
  const lastList = ['pee', 'poop', 'feed', 'water', 'walk', 'med'];
  document.getElementById('lastOf').innerHTML = `<div class="feed">` + lastList.map(t => {
    const l = S.logs.filter(x => x.petId === S.activePetId && x.type === t).sort((a, b) => b.ts - a.ts)[0];
    return `<div class="feed-item">
  <div class="feed-ic ${LOG_TYPES[t].cls}">${Icon(LOG_TYPES[t].icon)}</div>
  <div class="feed-body">
    <div class="feed-title">Last ${LOG_TYPES[t].label}</div>
    <div class="feed-meta">${l ? U.rel(l.ts) + ' · ' + U.fmtTime(l.ts) : '—'}</div>
  </div>
</div>`;
  }).join('') + '</div>';

  document.getElementById('notifDot').style.display = upcoming.length ? 'block' : 'none';
}
function statCard(cls, icon, lbl, val, sub) {
  return `<div class="stat"><div class="stat-ic ${cls}">${Icon(icon)}</div><div class="stat-lbl">${lbl}</div><div class="stat-val">${val}</div><div class="stat-sub">${sub}</div></div>`;
}
function shortLast(type) {
  const l = S.logs.filter(x => x.petId === S.activePetId && x.type === type).sort((a, b) => b.ts - a.ts)[0];
  return l ? U.rel(l.ts) : '—';
}
function feedRow(l) {
  const t = LOG_TYPES[l.type] || { label: l.type, emoji: '•', cls: 'ic-brand' };
  return `<div class="feed-item">
<div class="feed-ic ${t.cls}">${Icon(t.icon)}</div>
<div class="feed-body">
  <div class="feed-title">${t.label}${l.note ? ' · ' + U.esc(l.note) : ''}</div>
  <div class="feed-meta">${U.fmtTime(l.ts)} · ${U.rel(l.ts)}</div>
</div>
<button class="feed-del" data-del-log="${l.id}">${Icon('trash')}</button>
  </div>`;
}
function emptyRow(m) { return `<div class="empty" style="padding:20px 8px"><div class="empty-ic">${Icon('sparkle')}</div><div class="empty-sub">${m}</div></div>`; }

// Chart.js is loaded from a CDN and may fail (offline first install, CDN
// hiccup, etc). Guard every chart render so a missing library shows a
// friendly message instead of throwing and breaking the whole view.
function chartsAvailable() { return typeof Chart !== 'undefined' && !window.__chartJsFailed; }
function showChartFallback(wrapId, msg) {
  const wrap = document.getElementById(wrapId);
  if (wrap) wrap.innerHTML = `<div class="chart-fallback">${Icon('trendDown')} ${msg || "Charts couldn't load. Check your connection and reopen the app."}</div>`;
}

function computeStreak() {
  const days = new Set(S.logs.filter(l => l.petId === S.activePetId).map(l => U.today(l.ts).getTime()));
  let s = 0; const d = U.today();
  while (days.has(d.getTime())) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

export { renderDashboard, statCard, shortLast, feedRow, emptyRow, chartsAvailable, showChartFallback, computeStreak };
