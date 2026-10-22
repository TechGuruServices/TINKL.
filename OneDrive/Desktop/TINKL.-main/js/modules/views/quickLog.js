// Quick Log view — extracted from legacy.js lines 764-857
// (line 775, currentView(), moved to modules/navigation.js).

import { DB } from '../db.js';
import { S } from '../state.js';
import { U, loadAll } from '../utils.js';
import { Icon } from '../icons.js';
import { LOG_TYPES } from '../logTypes.js';
import { openModal } from '../modal.js';
import { goto, render, currentView } from '../navigation.js';

/* ================ Quick Log ================ */
async function quickLog(type, note = '', ts = Date.now()) {
  if (!S.activePetId) {
    U.toast('Add a pet first', 'error'); goto('pets'); return;
  }
  const log = { id: U.id(), petId: S.activePetId, type, ts, note };
  await DB.put('logs', log);
  await loadAll(); render(currentView());
  U.toast(LOG_TYPES[type].label + ' logged!', 'success');
  if (navigator.vibrate) navigator.vibrate(30);
}

function showLogPicker() {
  const types = Object.keys(LOG_TYPES);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);
  
  openModal({
    title: 'Log an activity',
    body: `<div class="chooser-grid" id="logChooser">
  ${types.map(t => `<div class="chooser" data-t="${t}"><span class="cic">${Icon(LOG_TYPES[t].icon)}</span>${LOG_TYPES[t].label}</div>`).join('')}
</div>
<div class="form-row"><label>Date</label><input type="date" id="logDate" value="${dateStr}" /></div>
<div class="form-row"><label>Time</label><input type="time" id="logTime" value="${timeStr}" /></div>
<div class="form-row"><label>Note (optional)</label><input id="logNote" placeholder="e.g. after dinner" /></div>`,
    actions: [{ label: 'Cancel', v: 'c' }],
    onAction: (v, close) => close(),
    onOpen: (b, close) => {
      let selectedType = null;
      b.querySelectorAll('[data-t]').forEach(c => c.addEventListener('click', async () => {
        selectedType = c.dataset.t;
        const dateVal = b.querySelector('#logDate').value;
        const timeVal = b.querySelector('#logTime').value;
        const note = b.querySelector('#logNote').value.trim();
        
        const [y, m, d] = dateVal.split('-').map(Number);
        const [h, mi] = timeVal.split(':').map(Number);
        const logDate = new Date(y, m - 1, d, h, mi, 0, 0);
        const ts = logDate.getTime();
        
        close();
        await quickLog(selectedType, note, ts);
      }));
    }
  });
}

async function openEditLogModal(logId) {
  const log = S.logs.find(l => l.id === logId);
  if (!log) return;
  
  const t = LOG_TYPES[log.type] || { label: log.type, emoji: '•', cls: 'ic-brand' };
  const logDate = new Date(log.ts);
  const dateStr = logDate.toISOString().slice(0, 10);
  const timeStr = logDate.toTimeString().slice(0, 5);
  
  openModal({
    title: `Edit ${t.label}`,
    body: `
  <div class="form-row"><label>Date</label><input type="date" id="editLogDate" value="${dateStr}" /></div>
  <div class="form-row"><label>Time</label><input type="time" id="editLogTime" value="${timeStr}" /></div>
  <div class="form-row"><label>Note</label><input id="editLogNote" value="${U.esc(log.note || '')}" placeholder="Optional" /></div>
`,
    actions: [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }],
    onAction: async (v, close, b) => {
      if (v === 'delete') {
        if (await U.confirm('Delete this log?', 'This action cannot be undone.')) {
          await DB.del('logs', logId);
          await loadAll(); render(currentView());
          close();
        }
        return;
      }
      if (!v) return close();
      
      const dateVal = b.querySelector('#editLogDate').value;
      const timeVal = b.querySelector('#editLogTime').value;
      const note = b.querySelector('#editLogNote').value.trim();
      
      const [y, m, d] = dateVal.split('-').map(Number);
      const [h, mi] = timeVal.split(':').map(Number);
      const newDate = new Date(y, m - 1, d, h, mi, 0, 0);
      
      log.ts = newDate.getTime();
      log.note = note;
      await DB.put('logs', log);
      await loadAll(); render(currentView());
      U.toast('Log updated', 'success');
      close();
    }
  });
}

export { quickLog, showLogPicker, openEditLogModal };
