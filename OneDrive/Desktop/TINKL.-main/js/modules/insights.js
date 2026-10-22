// Smart Insights — legacy.js lines 1610-1762 and 1817-1921.
// (buildVetReport, legacy lines 1763-1815, moved to modules/exportImport.js.)
// Chart.js is referenced as a global (deferred UMD script), never imported.

import { S } from './state.js';
import { U } from './utils.js';
import { LOG_TYPES } from './logTypes.js';
import { statCard, chartsAvailable, showChartFallback } from './views/dashboard.js';
import { calculateNextMedDue } from './views/health.js';
import { buildVetReport } from './exportImport.js';
import { analyzePet } from './healthRadar.js';

/* ================ Smart Insights ================ */
let _insightRange = 'day';
let _insightWeightChart = null;

// Build a structured data object from S.* for the active pet over the
// given window. This is the single source of truth fed to both the
// stat grid and the AI narrative, so the numbers are always consistent.
function buildInsightData(petId, range) {
  const now = Date.now();
  const MS = { day: 86400000, week: 7 * 86400000, month: 30 * 86400000 };
  const from = now - MS[range];
  const rangeLabel = { day: 'today', week: 'the past 7 days', month: 'the past 30 days' }[range];

  const pet = S.pets.find(p => p.id === petId) || {};
  const logs = S.logs.filter(l => l.petId === petId && l.ts >= from);
  const weights = S.weights.filter(w => w.petId === petId && w.ts >= from).sort((a, b) => a.ts - b.ts);
  const meds = S.meds.filter(m => m.petId === petId);
  const vaccs = S.vaccinations.filter(v => v.petId === petId);
  const notes = S.notes ? S.notes.filter(n => n.petId === petId && n.ts >= from) : [];

  // Activity counts
  const counts = {};
  logs.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1; });

  // Weight trend
  const wuDisplay = S.settings.weightUnit || 'lbs';
  const wPoints = weights.map(w => ({ ts: w.ts, val: U.toKg(w.value, w.unit), display: U.fmtWeight(U.toKg(w.value, w.unit), wuDisplay) }));
  const wFirst = wPoints[0]?.val, wLast = wPoints[wPoints.length - 1]?.val;
  const wDelta = (wFirst && wLast) ? U.kgToLbs(wLast - wFirst).toFixed(1) : null;

  // Med adherence: how many meds had at least one log hit this period
  const medTypes = new Set(meds.map(m => m.name.toLowerCase()));
  const medLogs = logs.filter(l => l.type === 'med').length;

  // Upcoming meds due
  const upcomingMeds = meds.filter(m => {
    const next = calculateNextMedDue(m);
    return next && next <= now + 7 * 86400000;
  });

  // Overdue vaccs (nextDue in the past)
  const overdueVaccs = vaccs.filter(v => v.nextDue && new Date(v.nextDue).getTime() < now);

  return { pet, range, rangeLabel, from, now, logs, counts, weights: wPoints, wFirst, wLast, wDelta, wuDisplay, meds, vaccs, notes, medLogs, upcomingMeds, overdueVaccs };
}

function renderInsightStatGrid(d) {
  const total = d.logs.length;
  const walks = d.counts['walk'] || 0;
  const feeds = d.counts['feed'] || 0;
  const accidents = d.counts['accident'] || 0;
  const wLabel = d.weights.length >= 2
    ? `${d.wDelta > 0 ? '+' : ''}${d.wDelta} lbs`
    : d.weights.length === 1 ? d.weights[0].display : '—';
  const wSub = d.weights.length >= 2 ? 'weight change' : d.weights.length === 1 ? 'logged' : 'no weigh-ins';

  document.getElementById('insightStatGrid').innerHTML =
    statCard('ic-brand', 'chart', 'Total Events', total, d.rangeLabel) +
    statCard('ic-walk', 'walking', 'Walks', walks, d.counts['walk'] ? 'logged' : 'none logged') +
    statCard('ic-food', 'bowl', 'Feedings', feeds, d.counts['feed'] ? 'logged' : 'none logged') +
    statCard('ic-brand', 'scale', 'Weight', wLabel, wSub) +
    statCard('ic-alert', 'alertTriangle', 'Accidents', accidents, accidents ? '⚠️ check pattern' : 'none ✓') +
    statCard('ic-med', 'pill', 'Meds Given', d.medLogs, d.medLogs ? 'logged' : 'none recorded');
}

function renderInsightBreakdown(d) {
  const total = d.logs.length || 1;
  const rows = Object.entries(d.counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => {
      const t = LOG_TYPES[type] || { label: type, emoji: '📝' };
      const pct = Math.round((count / total) * 100);
      return `
      <div style="display:flex;align-items:center;gap:10px">
        <span style="width:24px;text-align:center">${t.emoji}</span>
        <span style="width:90px;font-size:0.85rem;color:var(--text-2)">${t.label}</span>
        <div style="flex:1;background:var(--surface-2);border-radius:6px;height:8px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:6px;transition:width .4s"></div>
        </div>
        <span style="width:36px;text-align:right;font-size:0.82rem;color:var(--text-2)">${count}x</span>
      </div>`;
    });
  document.getElementById('insightBreakdown').innerHTML = rows.length
    ? rows.join('')
    : '<div class="text-mut" style="font-size:0.85rem">No activity logged in this period.</div>';
}

function renderInsightWeightChart(d) {
  const wrap = document.getElementById('insightWeightChartWrap');
  document.getElementById('insightWeightCard').style.display = d.weights.length < 2 ? 'none' : '';
  if (d.weights.length < 2) return;
  if (!chartsAvailable()) { showChartFallback('insightWeightChartWrap'); return; }
  const ctx = document.getElementById('insightWeightChart');
  if (!ctx) return;
  if (_insightWeightChart) _insightWeightChart.destroy();
  const vals = d.weights.map(w => d.wuDisplay === 'lbs' ? U.kgToLbs(w.val) : w.val);
  _insightWeightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.weights.map(w => U.fmtDate(w.ts)),
      datasets: [{ label: `Weight (${d.wuDisplay})`, data: vals, borderColor: '#7c8cff', backgroundColor: 'rgba(124,140,255,0.15)', fill: true, tension: 0.35, borderWidth: 3, pointRadius: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#b9bcd0' } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b9bcd0' } } } }
  });
}

function renderInsightNotesFeed(d) {
  document.getElementById('insightNotesFeed').innerHTML = d.notes.length
    ? d.notes.map(n => `<div class="feed-item"><div class="feed-body"><div class="feed-title">${U.esc(n.text || n.content || '')}</div><div class="feed-meta">${U.fmtDate(n.ts, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div></div></div>`).join('')
    : d.logs.filter(l => l.note).slice(-6).map(l => `<div class="feed-item"><div class="feed-body"><div class="feed-title">${U.esc(l.note)}</div><div class="feed-meta">${LOG_TYPES[l.type]?.emoji || '📝'} ${U.fmtDate(l.ts, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div></div></div>`).join('')
    || '<div class="text-mut" style="font-size:0.85rem;padding:4px 0">No notes in this period.</div>';
}

// Builds a plain-English structured summary for the AI to narrate from.
// Never passed as UI text — only used as the AI's input context.
function buildAIPrompt(d) {
  const petName = d.pet.name || 'the pet';
  const breed = d.pet.breed ? ` (${d.pet.breed})` : '';
  const age = d.pet.birthday ? (() => {
    const yrs = ((Date.now() - new Date(d.pet.birthday)) / (365.25 * 86400000));
    return yrs < 1 ? `${Math.round(yrs * 12)} months old` : `${Math.floor(yrs)} years old`;
  })() : '';
  const ageStr = age ? `, ${age}` : '';
  const total = d.logs.length;
  const walks = d.counts['walk'] || 0;
  const feeds = d.counts['feed'] || 0;
  const accidents = d.counts['accident'] || 0;
  const water = d.counts['water'] || 0;
  const play = d.counts['play'] || 0;
  const medLogs = d.medLogs;
  const wTrend = d.wDelta !== null ? `Weight changed by ${d.wDelta} lbs over the period.` : 'No weight data logged.';
  const overdueStr = d.overdueVaccs.length ? `OVERDUE VACCINATIONS: ${d.overdueVaccs.map(v => v.name).join(', ')}.` : '';
  const upcomingStr = d.upcomingMeds.length ? `Medications due soon: ${d.upcomingMeds.map(m => m.name).join(', ')}.` : '';
  const noteTexts = [...d.notes.map(n => n.text || n.content || ''), ...d.logs.filter(l => l.note).map(l => l.note)].filter(Boolean).slice(-5);
  const notesStr = noteTexts.length ? `Owner notes: ${noteTexts.join(' | ')}` : '';

  return `You are a knowledgeable, warm pet health assistant helping a pet owner understand their ${petName}${breed}${ageStr}'s health data.

DATA SUMMARY for ${d.rangeLabel.toUpperCase()}:
- Total logged events: ${total}
- Walks: ${walks} | Feedings: ${feeds} | Water: ${water} | Play sessions: ${play}
- Accidents/incidents: ${accidents}
- Medications administered: ${medLogs}
- ${wTrend}
${overdueStr}
${upcomingStr}
${notesStr}

Write a friendly, medically informative 3-5 sentence summary of ${petName}'s wellbeing over ${d.rangeLabel}. 
Highlight any patterns, concerns, or positives. Flag anything a veterinarian should know. 
End with one actionable tip. Keep it conversational, warm, and concise. No bullet points — flowing paragraph prose only.`;
}

async function generateInsightNarrative(d) {
  const el = document.getElementById('insightNarrative');
  el.innerHTML = '<span class="text-mut" style="font-size:0.85rem">✨ Generating summary…</span>';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{ role: 'user', content: buildAIPrompt(d) }]
      })
    });
    if (!res.ok) throw new Error('API ' + res.status);
    const json = await res.json();
    const text = (json.content || []).map(b => b.text || '').join('').trim();
    if (!text) throw new Error('empty');
    el.innerHTML = `<p style="margin:0">${U.esc(text).replace(/\n\n/g, '</p><p style="margin:12px 0 0">').replace(/\n/g, '<br>')}</p>`;
  } catch (e) {
    // Graceful fallback: build a rule-based narrative from the same data
    el.innerHTML = buildFallbackNarrative(d);
  }
}

function buildFallbackNarrative(d) {
  const name = d.pet.name || 'Your pet';
  const total = d.logs.length;
  const walks = d.counts['walk'] || 0;
  const feeds = d.counts['feed'] || 0;
  const accidents = d.counts['accident'] || 0;
  const range = d.rangeLabel;

  if (!total) return `<p style="margin:0;color:var(--text-2)">No activity was logged for ${name} during ${range}. Start logging walks, feedings, and health events to unlock AI summaries.</p>`;

  let parts = [];
  parts.push(`${name} had <strong>${total} logged event${total !== 1 ? 's' : ''}</strong> during ${range}.`);
  if (walks) parts.push(`Went on <strong>${walks} walk${walks !== 1 ? 's' : ''}</strong>.`);
  if (feeds) parts.push(`Had <strong>${feeds} feeding${feeds !== 1 ? 's' : ''}</strong>.`);
  if (d.wDelta !== null) parts.push(`Weight ${d.wDelta > 0 ? 'increased' : d.wDelta < 0 ? 'decreased' : 'stayed stable'} by <strong>${Math.abs(d.wDelta)} lbs</strong>.`);
  if (accidents) parts.push(`<span style="color:var(--gold)">⚠️ ${accidents} accident${accidents !== 1 ? 's' : ''} recorded — worth mentioning to your vet.</span>`);
  if (d.overdueVaccs.length) parts.push(`<span style="color:var(--alert)">⚠️ Overdue vaccinations: ${d.overdueVaccs.map(v => v.name).join(', ')}.</span>`);
  if (d.upcomingMeds.length) parts.push(`Medications due soon: ${d.upcomingMeds.map(m => m.name).join(', ')}.`);

  return `<p style="margin:0">${parts.join(' ')}</p>`;
}

function renderInsights() {
  if (!S.activePetId) {
    ['insightStatGrid', 'insightNarrative', 'insightVetReport', 'insightBreakdown', 'insightNotesFeed', 'insightRadar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="text-mut" style="font-size:0.85rem">Add a pet first to see insights.</div>';
    });
    return;
  }

  // Range tab wiring
  document.querySelectorAll('#insightRangeTabs [data-irange]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.irange === _insightRange);
    btn.onclick = () => { _insightRange = btn.dataset.irange; renderInsights(); };
  });

  const d = buildInsightData(S.activePetId, _insightRange);

  renderInsightStatGrid(d);
  renderInsightBreakdown(d);
  renderInsightWeightChart(d);
  renderInsightNotesFeed(d);

  // Health Radar (differentiator): on-device anomaly flags, trailing 30d.
  const radarFlags = analyzePet(S.activePetId, S.logs);
  const radarEl = document.getElementById('insightRadar');
  if (radarEl) {
    radarEl.innerHTML = `
    <div class="card">
      <div class="section-head margin-0-0-12">
        <div class="section-title">🛰 Health Radar</div>
        <span class="text-mut" style="font-size:.75rem">on-device · trailing 30 days</span>
      </div>
      ${radarFlags.length ? radarFlags.map(f => `
        <div class="feed-item">
          <div class="feed-body">
            <div class="feed-title">${U.esc(f.title)}</div>
            <div class="feed-meta">${U.esc(f.detail)}</div>
          </div>
          <span class="tag ${f.severity === 'urgent' ? 'due' : f.severity === 'warn' ? 'warn' : 'ok'}">${U.esc(f.severity)}</span>
        </div>`).join('')
      : `<div class="text-mut" style="font-size:.85rem">No anomalies detected for this pet in the trailing window.</div>`}
    </div>`;
  }

  // Vet report (always deterministic, no AI)
  const report = buildVetReport(d);
  document.getElementById('insightVetReport').innerHTML = `<pre style="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font-family:var(--font-mono,monospace);font-size:0.78rem;margin:0;color:var(--text-2);max-width:100%">${U.esc(report)}</pre>`;

  // AI narrative — only generate if not already showing the same pet+range
  const cacheKey = S.activePetId + '|' + _insightRange;
  const cached = document.getElementById('insightNarrative').dataset.cacheKey;
  if (cached !== cacheKey) {
    document.getElementById('insightNarrative').dataset.cacheKey = cacheKey;
    generateInsightNarrative(d);
  }

  // Refresh button
  document.getElementById('insightRefreshBtn').onclick = () => {
    document.getElementById('insightNarrative').dataset.cacheKey = '';
    generateInsightNarrative(d);
  };

  // Copy vet report
  document.getElementById('insightCopyBtn').onclick = async () => {
    try { await navigator.clipboard.writeText(report); U.toast('Report copied to clipboard', 'success'); }
    catch { U.toast('Copy failed', 'error'); }
  };

  // Print vet report
  document.getElementById('insightPrintBtn').onclick = () => {
    const pet = d.pet;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Vet Report – ${U.esc(pet.name || 'Pet')}</title>
<style>body{font-family:monospace;font-size:13px;line-height:1.75;padding:32px;color:#111;max-width:680px;margin:0 auto}
h1{font-size:16px;margin:0 0 4px}p{margin:4px 0}pre{white-space:pre-wrap;font-family:inherit}
@media print{body{padding:0}}</style></head>
<body><pre>${U.esc(report)}</pre><script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`);
    win.document.close();
  };
}

export { buildInsightData, renderInsightStatGrid, renderInsightBreakdown, renderInsightWeightChart, renderInsightNotesFeed, buildAIPrompt, generateInsightNarrative, buildFallbackNarrative, renderInsights };
