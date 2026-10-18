// Reminders — formatDays from legacy.js lines 1603-1609 plus the reminder UI
// (renderReminders, openRemModal, openEditRemModal, getUpcomingAlarms) from
// legacy.js lines 1922-2093, which sat textually inside the Smart Insights region.

import { DB } from './db.js';
import { S } from './state.js';
import { U, loadAll } from './utils.js';
import { Icon } from './icons.js';
import { LOG_TYPES } from './logTypes.js';
import { openModal } from './modal.js';
import { requestNotifPermission } from './settings.js';

/* ================ Reminders ================ */
function formatDays(days) {
  if (!days || !days.length) return 'once';
  if (days.length === 7) return 'every day';
  const N = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return days.map(function (d) { return N[d]; }).join(' ');
}

function renderReminders() {
  const list = S.reminders.filter(r => !r.petId || r.petId === S.activePetId);
  const el = document.getElementById('remList');
  el.innerHTML = list.length ? list.map(r => {
    const followUpLabel = r.followUpMinutes ? ` · re-alerts in ${r.followUpMinutes >= 60 ? (r.followUpMinutes / 60) + 'h' : r.followUpMinutes + 'min'}` : '';
    return `
<div class="rem" data-edit-rem="${r.id}" style="cursor:pointer">
  <div class="rem-ic ${LOG_TYPES[r.logType]?.cls || 'ic-brand'}">${Icon(LOG_TYPES[r.logType]?.icon || 'alarm')}</div>
  <div class="rem-body">
    <div class="rem-title">${U.esc(r.title)}</div>
    <div class="rem-meta">${r.time} · ${formatDays(r.days)}${followUpLabel}</div>
  </div>
  <button class="feed-del" data-del-r="${r.id}">${Icon('trash')}</button>
  <div class="switch ${r.on ? 'on' : ''}" data-tog="${r.id}"></div>
</div>
  `;
  }).join('') : `<div class="card"><div class="empty"><div class="empty-ic">${Icon('alarm')}</div><div class="empty-title">No reminders</div><div class="empty-sub">Set alarms for walks, feeds, meds & more</div></div></div>`;
  el.querySelectorAll('[data-edit-rem]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-del-r]') || e.target.closest('[data-tog]')) return;
      openEditRemModal(el.dataset.editRem);
    });
  });
  el.querySelectorAll('[data-tog]').forEach(s => s.onclick = (e) => {
    e.stopPropagation();
    const r = S.reminders.find(x => x.id === s.dataset.tog);
    r.on = !r.on; DB.put('reminders', r).then(() => { loadAll(); renderReminders(); });
  });
  el.querySelectorAll('[data-del-r]').forEach(b => b.onclick = async (e) => {
    e.stopPropagation();
    if (await U.confirm('Delete reminder?', 'This reminder will no longer fire.')) {
      await DB.del('reminders', b.dataset.delR); await loadAll(); renderReminders();
    }
  });
}
function openRemModal() {
  const now = new Date(); const t = now.toTimeString().slice(0, 5);
  openModal({
    title: 'Add reminder',
    body: `
  <div class="form-row"><label>Title *</label><input id="rTitle" placeholder="Morning walk" /></div>
  <div class="form-grid">
    <div class="form-row"><label>Type</label><select id="rType">${Object.keys(LOG_TYPES).map(k => `<option value="${k}">${LOG_TYPES[k].label}</option>`).join('')}</select></div>
    <div class="form-row"><label>Time</label><input type="time" id="rTime" value="${t}" /></div>
  </div>
  <div class="form-row"><label>Repeat on days</label>
    <div class="row" id="daysRow" style="gap:6px;flex-wrap:wrap">
      ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => `<button type="button" class="chart-tab" data-d="${i}" style="flex:1">${d}</button>`).join('')}
    </div>
  </div>
  <div class="form-row"><label>Remind me again if not done</label>
    <select id="rFollowUp">
      <option value="0" selected>Off</option>
      <option value="15">15 min later</option>
      <option value="30">30 min later</option>
      <option value="45">45 min later</option>
      <option value="60">1 hour later</option>
      <option value="120">2 hours later</option>
    </select>
  </div>
  <div class="form-row"><label>Notes</label><input id="rNote" placeholder="Optional" /></div>
`,
    actions: [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
    onOpen: (b) => {
      const selected = new Set([1, 2, 3, 4, 5, 6, 0]);
      const upd = () => b.querySelectorAll('[data-d]').forEach(x => x.classList.toggle('active', selected.has(+x.dataset.d)));
      b.querySelectorAll('[data-d]').forEach(x => x.onclick = () => { const i = +x.dataset.d; if (selected.has(i)) selected.delete(i); else selected.add(i); upd(); });
      upd();
      b._save = async () => {
        const title = b.querySelector('#rTitle').value.trim();
        if (!title) return U.toast('Title required', 'error');
        const rem = {
          id: U.id(), petId: S.activePetId, title,
          logType: b.querySelector('#rType').value,
          time: b.querySelector('#rTime').value,
          days: [...selected].sort(),
          note: b.querySelector('#rNote').value.trim(),
          followUpMinutes: U.safeNum(b.querySelector('#rFollowUp').value) || 0,
          followUpAt: null,
          on: true, createdAt: Date.now()
        };
        await DB.put('reminders', rem); await loadAll(); renderReminders();
        if (S.settings.notifications) requestNotifPermission();
        U.toast('Reminder added', 'success'); return true;
      };
    },
    onAction: async (v, close, b) => { if (!v) return close(); if (await b._save()) close(); }
  });
}
function openEditRemModal(remId) {
  const rem = S.reminders.find(r => r.id === remId);
  if (!rem) return;
  
  openModal({
    title: `Edit reminder`,
    body: `
  <div class="form-row"><label>Title *</label><input id="rTitle" value="${U.esc(rem.title)}" placeholder="Morning walk" /></div>
  <div class="form-grid">
    <div class="form-row"><label>Type</label><select id="rType">${Object.keys(LOG_TYPES).map(k => `<option value="${k}" ${k === rem.logType ? 'selected' : ''}>${LOG_TYPES[k].label}</option>`).join('')}</select></div>
    <div class="form-row"><label>Time</label><input type="time" id="rTime" value="${rem.time}" /></div>
  </div>
  <div class="form-row"><label>Repeat on days</label>
    <div class="row" id="daysRow" style="gap:6px;flex-wrap:wrap">
      ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => `<button type="button" class="chart-tab" data-d="${i}" style="flex:1">${d}</button>`).join('')}
    </div>
  </div>
  <div class="form-row"><label>Remind me again if not done</label>
    <select id="rFollowUp">
      <option value="0" ${!rem.followUpMinutes ? 'selected' : ''}>Off</option>
      <option value="15" ${rem.followUpMinutes === 15 ? 'selected' : ''}>15 min later</option>
      <option value="30" ${rem.followUpMinutes === 30 ? 'selected' : ''}>30 min later</option>
      <option value="45" ${rem.followUpMinutes === 45 ? 'selected' : ''}>45 min later</option>
      <option value="60" ${rem.followUpMinutes === 60 ? 'selected' : ''}>1 hour later</option>
      <option value="120" ${rem.followUpMinutes === 120 ? 'selected' : ''}>2 hours later</option>
    </select>
  </div>
  <div class="form-row"><label>Notes</label><input id="rNote" value="${U.esc(rem.note || '')}" placeholder="Optional" /></div>
`,
    actions: [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }],
    onOpen: (b) => {
      const selected = new Set(rem.days || []);
      const upd = () => b.querySelectorAll('[data-d]').forEach(x => x.classList.toggle('active', selected.has(+x.dataset.d)));
      b.querySelectorAll('[data-d]').forEach(x => x.onclick = () => { const i = +x.dataset.d; if (selected.has(i)) selected.delete(i); else selected.add(i); upd(); });
      upd();
      b._save = async () => {
        const title = b.querySelector('#rTitle').value.trim();
        if (!title) return U.toast('Title required', 'error');
        rem.title = title;
        rem.logType = b.querySelector('#rType').value;
        rem.time = b.querySelector('#rTime').value;
        rem.days = [...selected].sort();
        rem.note = b.querySelector('#rNote').value.trim();
        rem.followUpMinutes = U.safeNum(b.querySelector('#rFollowUp').value) || 0;
        // If follow-ups were turned off, cancel any already-pending one
        if (!rem.followUpMinutes) rem.followUpAt = null;
        await DB.put('reminders', rem); await loadAll(); renderReminders();
        U.toast('Reminder updated', 'success'); return true;
      };
    },
    onAction: async (v, close, b) => { 
      if (v === 'delete') {
        if (await U.confirm('Delete reminder?', 'This reminder will no longer fire.')) {
          await DB.del('reminders', remId); await loadAll(); renderReminders(); close();
        }
        return;
      }
      if (!v) return close(); 
      if (await b._save()) close(); 
    }
  });
}
function getUpcomingAlarms(n) {
  const now = new Date();
  const soon = [];
  S.reminders.filter(r => r.on).forEach(r => {
    const [h, mi] = r.time.split(':').map(Number);
    for (let i = 0; i < 7; i++) {
      const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(h, mi, 0, 0);
      if (d < now) continue;
      if (!r.days || r.days.includes(d.getDay())) {
        const diff = d - now;
        const days = Math.floor(diff / 86400000);
        const hrs = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const txt = days ? `in ${days}d ${hrs}h` : hrs ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
        soon.push({ ...r, next: d, nextText: `${d.toLocaleDateString([], { weekday: 'short' })} ${r.time} · ${txt}` });
        break;
      }
    }
  });
  return soon.sort((a, b) => a.next - b.next).slice(0, n);
}

export { formatDays, renderReminders, openRemModal, openEditRemModal, getUpcomingAlarms };
