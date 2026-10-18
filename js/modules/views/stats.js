// Stats view — extracted from legacy.js lines 1511-1601.
// Chart.js is referenced as a global (deferred UMD script), never imported.

import { S } from '../state.js';
import { U } from '../utils.js';
import { LOG_TYPES } from '../logTypes.js';
import { statCard, chartsAvailable, showChartFallback } from './dashboard.js';

/* ================ Stats ================ */
let trendC, timeC, breakC;
function renderStats() {
  // Defensive guard: repairLogs() heals bad records on load, but this
  // filter means a single malformed entry (e.g. from an old cloud
  // backup restore) can never turn the average into NaN again — it's
  // simply excluded from the calculation instead.
  const logs = S.logs.filter(l => l.petId === S.activePetId && Number.isFinite(l.ts));
  const days = new Set(logs.map(l => U.today(l.ts).getTime()));
  let long = 0, cur = 0; const sortedDays = [...days].sort();
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0 || sortedDays[i] - sortedDays[i - 1] === 86400000) cur++; else cur = 1;
    long = Math.max(long, cur);
  }
  const sortedByTs = [...logs].sort((a, b) => a.ts - b.ts);
  const gaps = [];
  for (let i = 1; i < sortedByTs.length; i++) gaps.push((sortedByTs[i].ts - sortedByTs[i - 1].ts) / 3600000);
  const avg = gaps.length ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : '—';

  document.getElementById('statsBig').innerHTML = `
${statCard('ic-brand', 'trendUp', 'Avg interval', avg, 'hours between')}
${statCard('ic-streak', 'trophy', 'Longest streak', long, 'days')}
${statCard('ic-alert', 'alertTriangle', 'Accidents', logs.filter(l => l.type === 'accident').length, 'all time')}
${statCard('ic-pee', 'barchart', 'Total logs', logs.length, 'all time')}
  `;

  // Trend
  const range = S.chartRange;
  const labels = []; const dataMap = {};
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const k = d.getTime();
    labels.push(d.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    dataMap[k] = { pee: 0, poop: 0, walk: 0, feed: 0 };
  }
  logs.forEach(l => {
    const k = U.today(l.ts).getTime();
    if (dataMap[k] && dataMap[k][l.type] !== undefined) dataMap[k][l.type]++;
  });
  const keys = Object.keys(dataMap);
  if (trendC) trendC.destroy();
  if (!chartsAvailable()) {
    showChartFallback('trendChartWrap', 'Trend chart unavailable — Chart.js failed to load.');
  } else {
    trendC = new Chart(document.getElementById('trendChart'), {
      type: 'bar',
      data: {
        labels, datasets: [
          { label: 'Pee', data: keys.map(k => dataMap[k].pee), backgroundColor: '#38bdf8', borderRadius: 6 },
          { label: 'Poop', data: keys.map(k => dataMap[k].poop), backgroundColor: '#b08968', borderRadius: 6 },
          { label: 'Walk', data: keys.map(k => dataMap[k].walk), backgroundColor: '#34d399', borderRadius: 6 },
          { label: 'Feed', data: keys.map(k => dataMap[k].feed), backgroundColor: '#fb923c', borderRadius: 6 },
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#b9bcd0' } } }, scales: { x: { stacked: true, grid: { display: false }, ticks: { color: '#b9bcd0' } }, y: { stacked: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b9bcd0' } } } }
    });
  }

  // Time of day
  const hours = Array(24).fill(0);
  logs.forEach(l => hours[new Date(l.ts).getHours()]++);
  if (timeC) timeC.destroy();
  if (!chartsAvailable()) {
    showChartFallback('timeChartWrap', 'Time-of-day chart unavailable — Chart.js failed to load.');
  } else {
    timeC = new Chart(document.getElementById('timeChart'), {
      type: 'line',
      data: { labels: hours.map((_, i) => i + ':00'), datasets: [{ label: 'Activity', data: hours, borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#b9bcd0', maxTicksLimit: 8 } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b9bcd0' } } } }
    });
  }

  // Breakdown
  const counts = {}; logs.forEach(l => counts[l.type] = (counts[l.type] || 0) + 1);
  const ks = Object.keys(counts);
  if (breakC) breakC.destroy();
  if (!chartsAvailable()) {
    showChartFallback('breakdownChartWrap', 'Breakdown chart unavailable — Chart.js failed to load.');
  } else {
    breakC = new Chart(document.getElementById('breakdownChart'), {
      type: 'doughnut',
      data: { labels: ks.map(k => LOG_TYPES[k]?.label || k), datasets: [{ data: ks.map(k => counts[k]), backgroundColor: ['#38bdf8', '#b08968', '#f87171', '#fb923c', '#60a5fa', '#34d399', '#f472b6', '#7c8cff', '#a855f7', '#facc15'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#b9bcd0', boxWidth: 12 } } } }
    });
  }

  document.querySelectorAll('#view-stats [data-range]').forEach(t => {
    t.classList.toggle('active', +t.dataset.range === S.chartRange);
    t.onclick = () => { S.chartRange = +t.dataset.range; renderStats(); };
  });
}

export { renderStats };
