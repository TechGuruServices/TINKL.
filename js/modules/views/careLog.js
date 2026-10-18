// Care Log view — extracted from legacy.js lines 1090-1125.

import { DB } from '../db.js';
import { S } from '../state.js';
import { U, loadAll } from '../utils.js';
import { Icon } from '../icons.js';
import { LOG_TYPES } from '../logTypes.js';
import { feedRow, emptyRow } from './dashboard.js';
import { openEditLogModal } from './quickLog.js';

/* ================ Care Log ================ */
function renderCare() {
  const f = document.getElementById('careFeed');
  const filter = S.careFilter;
  const list = S.logs.filter(l => l.petId === S.activePetId && (filter === 'all' || l.type === filter))
    .sort((a, b) => b.ts - a.ts);
  f.innerHTML = list.length ? list.map(l => {
    const t = LOG_TYPES[l.type] || { label: l.type, emoji: '•', cls: 'ic-brand' };
    return `<div class="feed-item" data-edit-log="${l.id}" style="cursor:pointer">
  <div class="feed-ic ${t.cls}">${Icon(t.icon)}</div>
  <div class="feed-body">
    <div class="feed-title">${t.label}${l.note ? ' · ' + U.esc(l.note) : ''}</div>
    <div class="feed-meta">${U.fmtDate(l.ts, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · ${U.rel(l.ts)}</div>
  </div>
  <button class="feed-del" data-del-log="${l.id}">${Icon('trash')}</button>
</div>`;
  }).join('') : emptyRow('No entries yet — tap + Log to start');
  document.querySelectorAll('#careFilters [data-f]').forEach(t => {
    t.classList.toggle('active', t.dataset.f === filter);
    t.onclick = () => { S.careFilter = t.dataset.f; renderCare(); };
  });
  document.querySelectorAll('[data-edit-log]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-del-log]')) return;
      openEditLogModal(el.dataset.editLog);
    });
  });
  document.querySelectorAll('[data-del-log]').forEach(b => {
    b.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (await U.confirm('Delete log?', 'This action cannot be undone.')) {
        await DB.del('logs', b.dataset.delLog); await loadAll(); renderCare();
      }
    });
  });
}

export { renderCare };
