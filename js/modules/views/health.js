// Health view (meds / vaccinations / weight / notes) — legacy.js lines 1127-1475.
// Chart.js is referenced as a global (deferred UMD script), never imported.

import { DB } from '../db.js';
import { S } from '../state.js';
import { U, loadAll, saveSettings } from '../utils.js';
import { Icon } from '../icons.js';
import { LOG_TYPES } from '../logTypes.js';
import { openModal } from '../modal.js';
import { chartsAvailable, showChartFallback, emptyRow } from './dashboard.js';
import { VACCINE_SCHEDULES, vaccinesForSpecies, findVaccineDef, suggestVaccineNextDue } from '../vaccineSchedule.js';
import { medAdherence, refillForecast } from '../adherence.js';
import { breedPercentile } from '../breedData.js';
import { buildVetSharePayload } from '../vetShare.js';
import { analyzePet } from '../healthRadar.js';

/* ================ Health ================ */
// Rule-based, deterministic schedule math — never guesses or infers from
// a medication's name. Only fires off numbers the user explicitly
// entered (start date + repeat interval), the same way vaccination
// "next due" dates are just stored/read, never invented.
function calculateNextMedDue(m) {
  if (!m.intervalDays || !m.start) return null;
  const interval = U.safeNum(m.intervalDays);
  if (interval <= 0) return null;
  const start = new Date(m.start); if (Number.isNaN(start.getTime())) return null;
  const now = Date.now();
  if (start.getTime() > now) return start.getTime();
  const cycles = Math.ceil((now - start.getTime()) / (interval * 86400000));
  const next = start.getTime() + cycles * interval * 86400000;
  if (m.until) { const until = new Date(m.until).getTime(); if (!Number.isNaN(until) && next > until) return null; }
  return next;
}
function renderHealth() {
  // Meds
  const meds = S.meds.filter(m => m.petId === S.activePetId);
  document.getElementById('medList').innerHTML = meds.length ? meds.map(m => {
    const nextDue = calculateNextMedDue(m);
    const overdue = nextDue && nextDue < Date.now();
    const dueTxt = nextDue ? ` · ${overdue ? '⚠️ overdue' : 'next dose'} ${U.fmtDate(nextDue)}` : '';
    // Medication adherence (differentiator): trailing-14d % + refill forecast.
    const adh = medAdherence(m, S.logs);
    const adhTxt = adh.pct == null ? '' : ` · adherence ${adh.pct}% (${adh.taken}/${adh.expected}, 14d)`;
    const fc = refillForecast(m, S.logs);
    const fcTxt = fc.runOutDate ? ` · ~${fc.dosesRemaining} dose${fc.dosesRemaining === 1 ? '' : 's'} left, runs out ${U.fmtDate(fc.runOutDate)}` : '';
    return `
<div class="feed-item" data-edit-med="${m.id}" style="cursor:pointer">
  <div class="feed-ic ic-med">${Icon('pill')}</div>
  <div class="feed-body">
    <div class="feed-title">${U.esc(m.name)} ${m.dose ? '· ' + U.esc(m.dose) : ''}</div>
    <div class="feed-meta">${U.esc(m.schedule || 'As needed')}${m.until ? ' · until ' + U.fmtDate(m.until) : ''}${dueTxt}${adhTxt}${fcTxt}</div>
    ${fc.suggestReminder ? `<button class="btn btn-secondary" data-refill-rem="${m.id}" style="margin-top:6px">＋ Add refill reminder</button>` : ''}
  </div>
  <button class="feed-del" data-del-med="${m.id}">${Icon('trash')}</button>
</div>
  `;
  }).join('') : emptyRow('No medications yet');
  document.querySelectorAll('[data-refill-rem]').forEach(b => b.onclick = async (e) => {
    e.stopPropagation(); // don't open the med editor beneath
    const m = S.meds.find(x => x.id === b.dataset.refillRem);
    if (!m) return;
    const fc = refillForecast(m, S.logs);
    await DB.put('reminders', {
      id: U.id(), petId: m.petId,
      title: `Refill ${m.name}`,
      logType: 'med',
      time: '09:00',
      days: [],
      note: fc.runOutDate ? `Estimated run-out: ${U.fmtDate(fc.runOutDate)}` : '',
      followUpMinutes: 0, followUpAt: null,
      on: true, createdAt: Date.now(),
    });
    await loadAll();
    U.toast(`Refill reminder set for ${m.name}`, 'success');
  });
  document.querySelectorAll('[data-edit-med]').forEach(row => row.onclick = (e) => {
    if (e.target.closest('[data-del-med]')) return;
    openMedModal(S.meds.find(m => m.id === row.dataset.editMed));
  });
  document.querySelectorAll('[data-del-med]').forEach(b => b.onclick = async (e) => {
    e.stopPropagation();
    if (await U.confirm('Remove medication?', 'This removes the medication entry.')) {
      await DB.del('meds', b.dataset.delMed); await loadAll(); renderHealth();
    }
  });

  // Vaccinations
  const vacs = S.vaccinations.filter(v => v.petId === S.activePetId).sort((a, b) => new Date(a.nextDue || 0) - new Date(b.nextDue || 0));
  document.getElementById('vacList').innerHTML = vacs.length ? vacs.map(v => {
    const due = v.nextDue ? new Date(v.nextDue) : null;
    const days = due ? Math.ceil((due - Date.now()) / 86400000) : null;
    const tag = days == null ? '' : days < 0 ? `<div class="tag due">Overdue</div>` : days < 30 ? `<div class="tag warn">Due in ${days}d</div>` : `<div class="tag ok">${days}d</div>`;
    const coreTag = v.core ? '<span style="font-size:0.68rem;color:var(--brand);font-weight:600">CORE</span> · ' : '';
    return `<div class="feed-item" data-edit-vac="${v.id}" style="cursor:pointer">
  <div class="feed-ic ic-food">${Icon('syringe')}</div>
  <div class="feed-body">
    <div class="feed-title">${U.esc(v.name)}</div>
    <div class="feed-meta">${coreTag}Last: ${v.lastGiven ? U.fmtDate(v.lastGiven) : '—'}${v.nextDue ? ' · Next: ' + U.fmtDate(v.nextDue) : ''}</div>
  </div>
  ${tag}
  <button class="feed-del" data-del-vac="${v.id}">${Icon('trash')}</button>
</div>`;
  }).join('') : emptyRow('No vaccinations tracked');
  document.querySelectorAll('[data-edit-vac]').forEach(row => row.onclick = (e) => {
    if (e.target.closest('[data-del-vac]')) return;
    openVacModal(S.vaccinations.find(v => v.id === row.dataset.editVac));
  });
  document.querySelectorAll('[data-del-vac]').forEach(b => b.onclick = async (e) => {
    e.stopPropagation();
    if (await U.confirm('Remove vaccination?', 'This removes the vaccination record.')) {
      await DB.del('vaccinations', b.dataset.delVac); await loadAll(); renderHealth();
    }
  });

  // Weight
  const ws = S.weights.filter(w => w.petId === S.activePetId).sort((a, b) => a.ts - b.ts);
  renderWeightChart(ws);
  const wu = S.settings.weightUnit || 'kg';
  document.querySelectorAll('#weightUnitToggle [data-wunit]').forEach(b => {
    b.classList.toggle('active', b.dataset.wunit === wu);
    b.onclick = () => { S.settings.weightUnit = b.dataset.wunit; saveSettings(); renderHealth(); };
  });
  // Breed percentile (differentiator): latest weight vs healthy breed band.
  // breedPercentile returns null for mix/unknown/unmatched breeds → render nothing.
  const hPet = S.pets.find(p => p.id === S.activePetId);
  const hLatestW = ws.length ? [...ws].sort((a, b) => b.ts - a.ts)[0] : null;
  let breedLine = '';
  if (hLatestW && hPet) {
    const bp = breedPercentile(hPet.species, hPet.breed, U.toKg(hLatestW.value, hLatestW.unit));
    if (bp) breedLine = `<div class="feed-meta">Breed band: ${bp.percentile}th percentile of healthy adult ${U.esc(hPet.breed)} range (${bp.minKg}–${bp.maxKg} kg)</div>`;
  }
  document.getElementById('weightList').innerHTML = ws.length ? [...ws].reverse().slice(0, 6).map((w, wi) => `
<div class="feed-item" data-edit-w="${w.id}" style="cursor:pointer">
  <div class="feed-ic ic-brand">${Icon('scale')}</div>
  <div class="feed-body">
    <div class="feed-title">${U.fmtWeight(U.toKg(w.value, w.unit), wu)}</div>
    <div class="feed-meta">${U.fmtDate(w.ts, { year: 'numeric', month: 'short', day: 'numeric' })}${w.note ? ' · ' + U.esc(w.note) : ''}</div>
    ${wi === 0 ? breedLine : ''}
  </div>
  <button class="feed-del" data-del-w="${w.id}">${Icon('trash')}</button>
</div>
  `).join('') : emptyRow('No weight entries');
  document.querySelectorAll('[data-edit-w]').forEach(row => row.onclick = (e) => {
    if (e.target.closest('[data-del-w]')) return;
    openWeightModal(S.weights.find(w => w.id === row.dataset.editW));
  });
  document.querySelectorAll('[data-del-w]').forEach(b => b.onclick = async (e) => {
    e.stopPropagation();
    await DB.del('weights', b.dataset.delW); await loadAll(); renderHealth();
  });

  // Notes
  const notes = S.notes.filter(n => n.petId === S.activePetId).sort((a, b) => b.ts - a.ts);
  document.getElementById('noteList').innerHTML = notes.length ? notes.map(n => `
<div class="feed-item" data-edit-n="${n.id}" style="cursor:pointer">
  <div class="feed-ic ic-brand">${Icon('note')}</div>
  <div class="feed-body">
    <div class="feed-title">${U.esc(n.title)}</div>
    <div class="feed-meta">${U.fmtDate(n.ts, { month: 'short', day: 'numeric', year: 'numeric' })}${n.body ? ' · ' + U.esc(n.body) : ''}</div>
  </div>
  <button class="feed-del" data-del-n="${n.id}">${Icon('trash')}</button>
</div>
  `).join('') : emptyRow('No notes or vet visits logged');
  document.querySelectorAll('[data-edit-n]').forEach(row => row.onclick = (e) => {
    if (e.target.closest('[data-del-n]')) return;
    openNoteModal(S.notes.find(n => n.id === row.dataset.editN));
  });
  document.querySelectorAll('[data-del-n]').forEach(b => b.onclick = async (e) => {
    e.stopPropagation();
    await DB.del('notes', b.dataset.delN); await loadAll(); renderHealth();
  });

  // Vet Pass (differentiator): shareable read-only report — link + QR + share.
  let vetPassWrap = document.getElementById('vetPassWrap');
  if (!vetPassWrap) {
    vetPassWrap = document.createElement('div');
    vetPassWrap.id = 'vetPassWrap';
    vetPassWrap.className = 'card';
    document.getElementById('view-health')?.appendChild(vetPassWrap);
  }
  vetPassWrap.innerHTML = `
    <div class="section-head margin-0-0-12">
      <div class="section-title">🔗 Vet Pass</div>
    </div>
    <p class="text-mut" style="font-size:.85rem;margin:0 0 10px">Share a read-only health report with your vet — no sign-in needed.</p>
    <button class="btn" id="vetPassBtn">🔗 Vet Pass — share read-only report</button>`;
  document.getElementById('vetPassBtn').onclick = async () => {
    const pet = S.pets.find(p => p.id === S.activePetId);
    if (!pet) return U.toast('Add a pet first', 'error');
    let payload;
    try {
      payload = buildVetSharePayload({
        pet,
        logs: S.logs,
        radarFlags: analyzePet(pet.id, S.logs),
        vetReportText: document.getElementById('insightVetReport')?.innerText || '',
        meds: S.meds.filter(m => m.petId === pet.id),
        weights: S.weights.filter(w => w.petId === pet.id),
      });
    } catch (e) {
      return U.toast(e.message, 'error'); // LZString vendor script not loaded
    }
    const url = location.origin + '/vetpass.html?d=' + payload;

    try {
      await navigator.clipboard.writeText(url);
      U.toast('Vet Pass link copied', 'success');
    } catch (err) {
      window.prompt('Copy your Vet Pass link:', url);
    }

    // QR via the vendored qrcode-generator (window.qrcode, classic script).
    // 1.4.4's createSvgTag takes (cellSize, margin) — not an options object.
    try {
      const qr = window.qrcode(0, 'M'); // 0 = auto version
      qr.addData(url);
      qr.make();
      openModal({
        title: `${pet.name} — Vet Pass`,
        body: `<div style="text-align:center">${qr.createSvgTag(4, 8)}</div>
               <p class="text-mut" style="font-size:.85rem">Scan to open the read-only report, or share the copied link. The page works without signing in.</p>`,
        actions: [{ label: 'Done', v: 'ok' }],
        onAction: (v, close) => close(),
      });
    } catch (e) {
      U.toast('QR unavailable — use the copied link', 'info');
    }

    if (navigator.share) {
      navigator.share({ title: `${pet.name} — Vet Pass`, text: 'Read-only health report', url }).catch(() => {});
    }
  };
}

let weightChartI;
function renderWeightChart(ws) {
  if (!chartsAvailable()) { showChartFallback('weightChartWrap', ws.length ? 'Weight chart unavailable — Chart.js failed to load.' : undefined); return; }
  const ctx = document.getElementById('weightChart'); if (!ctx) return;
  if (weightChartI) weightChartI.destroy();
  if (!ws.length) return;
  const wu = S.settings.weightUnit || 'kg';
  // Every entry may have been logged in kg or lbs independently — always
  // normalize to kg first (single source of truth), then convert once to
  // whichever unit the user wants displayed. Never mix raw stored values.
  const plotVals = ws.map(w => {
    const kg = U.toKg(w.value, w.unit);
    return wu === 'lbs' ? U.kgToLbs(kg) : kg;
  });
  weightChartI = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ws.map(w => U.fmtDate(w.ts)),
      datasets: [{
        label: `Weight (${wu})`, data: plotVals,
        borderColor: '#7c8cff', backgroundColor: 'rgba(124,140,255,0.15)',
        fill: true, tension: 0.35, borderWidth: 3, pointRadius: 3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#b9bcd0' } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b9bcd0' } } } }
  });
}

function openMedModal(med) {
  const edit = !!med;
  openModal({
    title: edit ? 'Edit medication' : 'Add medication',
    body: `
  <div class="form-row"><label>Medication name *</label><input id="mName" value="${edit ? U.esc(med.name || '') : ''}" placeholder="Apoquel" /></div>
  <div class="form-grid">
    <div class="form-row"><label>Dose</label><input id="mDose" value="${edit ? U.esc(med.dose || '') : ''}" placeholder="5mg" /></div>
    <div class="form-row"><label>Schedule</label><input id="mSched" value="${edit ? U.esc(med.schedule || '') : ''}" placeholder="1x daily, morning" /></div>
  </div>
  <div class="form-grid">
    <div class="form-row"><label>Started</label><input type="date" id="mStart" value="${med?.start || new Date().toISOString().slice(0, 10)}" /></div>
    <div class="form-row"><label>Until (optional)</label><input type="date" id="mUntil" value="${med?.until || ''}" /></div>
  </div>
  <div class="form-row"><label>Repeats every (days, optional)</label><input type="number" min="1" step="1" id="mInterval" value="${med?.intervalDays || ''}" placeholder="e.g. 30 for a monthly flea/tick dose" /></div>
`,
    actions: edit
      ? [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }]
      : [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
    onAction: async (v, close, b) => {
      if (!v) return close();
      if (v === 'delete') {
        if (await U.confirm('Remove medication?', 'This removes the medication entry.')) {
          await DB.del('meds', med.id); await loadAll(); renderHealth(); close();
        }
        return;
      }
      const name = b.querySelector('#mName').value.trim();
      if (!name || !S.activePetId) return U.toast('Name & active pet required', 'error');
      await DB.put('meds', {
        id: med?.id || U.id(), petId: S.activePetId, name,
        dose: b.querySelector('#mDose').value.trim(),
        schedule: b.querySelector('#mSched').value.trim(),
        start: b.querySelector('#mStart').value,
        until: b.querySelector('#mUntil').value,
        intervalDays: b.querySelector('#mInterval').value ? U.safeNum(b.querySelector('#mInterval').value) : null,
        createdAt: med?.createdAt || Date.now()
      });
      await loadAll(); renderHealth(); close(); U.toast(edit ? 'Medication updated' : 'Medication added', 'success');
    }
  });
}
function openVacModal(vac) {
  const edit = !!vac;
  const pet = S.pets.find(p => p.id === S.activePetId);
  const species = pet?.species || 'dog';
  const options = vaccinesForSpecies(species);
  const currentDefId = vac ? (VACCINE_SCHEDULES.find(v => v.name === vac.name)?.id || 'custom') : options[0]?.id;

  openModal({
    title: edit ? 'Edit vaccination' : 'Add vaccination',
    body: `
  <div class="form-row"><label>Vaccine *</label><select id="vDef">
    ${options.map(o => `<option value="${o.id}" ${o.id === currentDefId ? 'selected' : ''}>${o.name}${o.core ? ' (core)' : ''}</option>`).join('')}
  </select></div>
  <div class="form-row" id="vCustomNameRow" style="display:none">
    <label>Custom vaccine name *</label><input id="vCustomName" value="${edit && currentDefId === 'custom' ? U.esc(vac.name || '') : ''}" placeholder="e.g. Feline FIP" />
  </div>
  <div class="form-row" id="vInfoRow" style="background:var(--surface-2);border-radius:10px;padding:10px 12px;font-size:0.8rem;color:var(--text-2);line-height:1.5"></div>
  <div class="form-grid">
    <div class="form-row"><label>Last given</label><input type="date" id="vLast" value="${vac?.lastGiven || new Date().toISOString().slice(0, 10)}" /></div>
    <div class="form-row"><label>Next due</label><input type="date" id="vNext" value="${vac?.nextDue || ''}" /></div>
  </div>
  <div class="form-row" id="vSuggestRow" style="font-size:0.78rem;color:var(--brand);display:none"></div>
  <div class="form-row"><label>Vet / clinic</label><input id="vVet" value="${edit ? U.esc(vac.vet || '') : ''}" placeholder="Dr. Smith" /></div>
`,
    actions: edit
      ? [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }]
      : [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
    onOpen: (b) => {
      const defSel = b.querySelector('#vDef');
      const customRow = b.querySelector('#vCustomNameRow');
      const infoRow = b.querySelector('#vInfoRow');
      const suggestRow = b.querySelector('#vSuggestRow');
      const lastInput = b.querySelector('#vLast');
      const nextInput = b.querySelector('#vNext');
      let userEditedNext = !!vac?.nextDue; // don't clobber a manually-set date on open

      const refreshInfo = () => {
        const def = findVaccineDef(defSel.value);
        customRow.style.display = def?.id === 'custom' ? '' : 'none';
        infoRow.textContent = def ? (def.core ? '🛡️ ' : 'ℹ️ ') + def.info : '';
      };
      const refreshSuggestion = () => {
        const def = findVaccineDef(defSel.value);
        const suggestion = suggestVaccineNextDue(def, lastInput.value, pet?.birthday);
        if (suggestion && !userEditedNext) {
          nextInput.value = suggestion.date;
          suggestRow.style.display = '';
          suggestRow.textContent = `✨ Suggested per standard protocol: ${suggestion.rationale} You can override this date.`;
        } else if (suggestion) {
          suggestRow.style.display = '';
          suggestRow.textContent = `ℹ️ Standard protocol would suggest ${U.fmtDate(suggestion.date)}. ${suggestion.rationale}`;
        } else {
          suggestRow.style.display = 'none';
        }
      };

      defSel.onchange = () => { userEditedNext = false; refreshInfo(); refreshSuggestion(); };
      lastInput.onchange = () => { userEditedNext = false; refreshSuggestion(); };
      nextInput.onchange = () => { userEditedNext = true; };

      refreshInfo(); refreshSuggestion();

      b._save = async () => {
        const def = findVaccineDef(defSel.value);
        const name = def?.id === 'custom' ? b.querySelector('#vCustomName').value.trim() : def?.name;
        if (!name || !S.activePetId) { U.toast('Vaccine name & active pet required', 'error'); return false; }
        const data = {
          id: vac?.id || U.id(), petId: S.activePetId, name,
          lastGiven: lastInput.value,
          nextDue: nextInput.value,
          vet: b.querySelector('#vVet').value.trim(),
          core: !!def?.core,
          createdAt: vac?.createdAt || Date.now()
        };
        await DB.put('vaccinations', data);
        await loadAll(); renderHealth();
        U.toast(edit ? 'Vaccination updated' : 'Vaccination saved', 'success');
        return true;
      };
    },
    onAction: async (v, close, b) => {
      if (!v) return close();
      if (v === 'delete') {
        if (await U.confirm('Remove vaccination?', 'This removes the vaccination record.')) {
          await DB.del('vaccinations', vac.id); await loadAll(); renderHealth(); close();
        }
        return;
      }
      if (await b._save()) close();
    }
  });
}
function openWeightModal(w) {
  const edit = !!w;
  openModal({
    title: edit ? 'Edit weight entry' : 'Log weight',
    body: `
  <div class="form-row"><label>Date</label><input type="date" id="wDate" value="${w ? new Date(w.ts).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}" /></div>
  <div class="form-grid">
    <div class="form-row"><label>Weight *</label><input type="number" step="0.1" id="wVal" value="${w ? w.value : ''}" placeholder="12.5" /></div>
    <div class="form-row"><label>Unit</label><select id="wUnit"><option ${(w?.unit || S.settings.weightUnit || 'kg') === 'kg' ? 'selected' : ''}>kg</option><option ${(w?.unit || S.settings.weightUnit || 'kg') === 'lbs' ? 'selected' : ''}>lbs</option></select></div>
  </div>
  <div class="form-row"><label>Note</label><input id="wNote" value="${edit ? U.esc(w.note || '') : ''}" placeholder="After vet visit" /></div>
`,
    actions: edit
      ? [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }]
      : [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
    onAction: async (v, close, b) => {
      if (!v) return close();
      if (v === 'delete') {
        if (await U.confirm('Remove weight entry?', 'This removes the logged weight.')) {
          await DB.del('weights', w.id); await loadAll(); renderHealth(); close();
        }
        return;
      }
      const val = b.querySelector('#wVal').value;
      if (!val || !S.activePetId) return U.toast('Weight & active pet required', 'error');
      await DB.put('weights', {
        id: w?.id || U.id(), petId: S.activePetId, ts: new Date(b.querySelector('#wDate').value).getTime(),
        value: U.safeNum(val), unit: b.querySelector('#wUnit').value, note: b.querySelector('#wNote').value.trim()
      });
      await loadAll(); renderHealth(); close(); U.toast(edit ? 'Weight entry updated' : 'Weight logged', 'success');
    }
  });
}
function openNoteModal(note) {
  const edit = !!note;
  openModal({
    title: edit ? 'Edit note / vet visit' : 'Add note / vet visit',
    body: `
  <div class="form-row"><label>Title *</label><input id="nTitle" value="${edit ? U.esc(note.title || '') : ''}" placeholder="Vet check-up" /></div>
  <div class="form-row"><label>Date</label><input type="date" id="nDate" value="${note ? new Date(note.ts).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}" /></div>
  <div class="form-row"><label>Details</label><textarea id="nBody" placeholder="Everything is looking healthy…">${edit ? U.esc(note.body || '') : ''}</textarea></div>
`,
    actions: edit
      ? [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }]
      : [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
    onAction: async (v, close, b) => {
      if (!v) return close();
      if (v === 'delete') {
        if (await U.confirm('Remove note?', 'This removes the note / vet visit record.')) {
          await DB.del('notes', note.id); await loadAll(); renderHealth(); close();
        }
        return;
      }
      const t = b.querySelector('#nTitle').value.trim();
      if (!t || !S.activePetId) return U.toast('Title & active pet required', 'error');
      await DB.put('notes', {
        id: note?.id || U.id(), petId: S.activePetId, title: t,
        body: b.querySelector('#nBody').value.trim(),
        ts: new Date(b.querySelector('#nDate').value).getTime()
      });
      await loadAll(); renderHealth(); close(); U.toast(edit ? 'Note updated' : 'Note added', 'success');
    }
  });
}

export { calculateNextMedDue, renderHealth, renderWeightChart, openMedModal, openVacModal, openWeightModal, openNoteModal };
