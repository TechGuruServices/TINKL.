// History view — extracted from legacy.js lines 1477-1506.
// (Calendar button bindings at legacy lines 1507-1509 moved to js/app.js.)

import { S } from '../state.js';
import { feedRow, emptyRow } from './dashboard.js';

/* ================ History ================ */
function renderHistory() { renderCalendar(); renderDay(); }
function renderCalendar() {
  const y = S.calDate.getFullYear(), m = S.calDate.getMonth();
  document.getElementById('calTitle').textContent = S.calDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const first = new Date(y, m, 1); const startDow = first.getDay();
  const last = new Date(y, m + 1, 0).getDate();
  const prevLast = new Date(y, m, 0).getDate();
  const grid = document.getElementById('calGrid');
  const wds = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div class="cal-wd">${d}</div>`).join('');
  const cells = [];
  for (let i = startDow - 1; i >= 0; i--) cells.push({ d: prevLast - i, other: true, ts: null });
  for (let d = 1; d <= last; d++) cells.push({ d, other: false, ts: new Date(y, m, d) });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length - startDow - last + 1, other: true, ts: null });

  grid.innerHTML = wds + cells.map(c => {
    if (c.other) return `<div class="cal-day other">${c.d}</div>`;
    const today = c.ts.toDateString() === new Date().toDateString();
    const sel = c.ts.toDateString() === S.calSel.toDateString();
    const has = S.logs.some(l => l.petId === S.activePetId && new Date(l.ts).toDateString() === c.ts.toDateString());
    return `<div class="cal-day ${today ? 'today' : ''} ${sel ? 'selected' : ''}" data-day="${c.ts.toISOString()}">${c.d}${has ? '<div class="dot"></div>' : ''}</div>`;
  }).join('');
  grid.querySelectorAll('[data-day]').forEach(el => el.onclick = () => { S.calSel = new Date(el.dataset.day); renderCalendar(); renderDay(); });
}
function renderDay() {
  const day = S.calSel;
  document.getElementById('dayTitle').textContent = day.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const logs = S.logs.filter(l => l.petId === S.activePetId && new Date(l.ts).toDateString() === day.toDateString()).sort((a, b) => b.ts - a.ts);
  document.getElementById('dayFeed').innerHTML = logs.length ? logs.map(feedRow).join('') : emptyRow('No activity for this day');
}

export { renderHistory, renderCalendar, renderDay };
