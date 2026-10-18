# WIRING.md — Worker C differentiator integration guide

How to surface the 5 new Worker C features in the refactored app. For each
item: **target file**, **anchor** (legacy function name the refactored code
derives from — verify the exact marker after the refactor lands), and the
**exact snippet** to insert.

Shared notes:
- All snippets assume the refactored module scope has `S` (state), `U` (with
  `U.esc`, `U.id`, `U.toast`), `openModal`, and `DB`/`loadAll` as in
  legacy.js. If the refactor renamed any of these, adapt the identifiers.
- Vendor scripts: `js/vendor/lz-string.min.js` (window.LZString) and
  `js/vendor/qrcode-generator.js` (window.qrcode) are fetched from cdnjs
  into the project. Add classic `<script>` tags for them in the app shell
  (order: before the module bundle; classic scripts are fine alongside
  modules). They are only needed for the Vet Pass QR/link flow.
- CSS classes referenced below already exist in `css/main.css`:
  `.card`, `.feed-item`, `.feed-body`, `.feed-title`, `.feed-meta`,
  `.tag` + `.tag.warn` (gold) / `.tag.due` (red) / `.tag.ok` (green),
  `.section-head`, `.section-title`, `.text-mut`, `.empty`, `.empty-ic`,
  `.empty-sub`. There is **no** dedicated banner/alert class — reuse
  `.card` + `.tag.*` as below.

---

## a. Dashboard radar banner

**Target file:** `js/modules/views/dashboard.js`
**Anchor:** inside `renderDashboard()` (legacy.js ~line 634), at the top of
the view's rendered output.

```js
import { analyzePet } from '../healthRadar.js';

function renderDashboard() {
  // ...existing setup; S.activePetId and S.logs are in scope...
  const radarFlags = S.activePetId ? analyzePet(S.activePetId, S.logs) : [];

  const banner = radarFlags.length ? `
    <div class="card" id="radarBanner" style="border-left:4px solid var(--gold)">
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
          <span class="tag ${f.severity === 'urgent' ? 'due' : f.severity === 'warn' ? 'warn' : 'ok'}">${f.severity}</span>
        </div>`).join('')}
    </div>` : '';

  // Prepend `banner` to whatever HTML the dashboard renders
  // (e.g. container.innerHTML = banner + rest), then:
  document.getElementById('radarDismiss')?.addEventListener('click', () =>
    document.getElementById('radarBanner')?.remove());
}
```

Dismissal is session-only (element removal, no persistence). Guard:
`analyzePet` returns `[]` when the pet has < 7 days of history, so new
pets never see a banner.

---

## b. Insights radar section

**Target file:** `js/modules/insights.js`
**Anchor:** inside the `renderInsights()` flow (legacy.js ~line 1863), after
`const d = buildInsightData(S.activePetId, _insightRange);`. Requires a new
`<div id="insightRadar"></div>` mount point in the insights view markup.

```js
import { analyzePet } from './healthRadar.js';

// inside renderInsights(), after buildInsightData(...):
const radarFlags = S.activePetId ? analyzePet(S.activePetId, S.logs) : [];
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
          <span class="tag ${f.severity === 'urgent' ? 'due' : f.severity === 'warn' ? 'warn' : 'ok'}">${f.severity}</span>
        </div>`).join('')
      : `<div class="text-mut" style="font-size:.85rem">No anomalies detected for this pet in the trailing window.</div>`}
    </div>`;
}
```

---

## c. Health view — adherence, refill forecast, breed percentile, Vet Pass

**Target file:** `js/modules/views/health.js`
**Anchor:** inside `renderHealth()` (legacy.js ~line 1144): the med-list
`meds.map(...)` block, the weight section, and wherever the view's action
buttons live.

```js
import { medAdherence, refillForecast } from '../adherence.js';
import { breedPercentile } from '../breedData.js';
import { buildVetSharePayload } from '../vetShare.js';
import { analyzePet } from '../healthRadar.js';
```

### c1. Per-med adherence % line (inside the meds `.map(m => {...})`)

```js
const adh = medAdherence(m, S.logs); // { pct, expected, taken } over trailing 14d
const adhTxt = adh.pct == null
  ? ''
  : ` · adherence ${adh.pct}% (${adh.taken}/${adh.expected} doses, 14d)`;
// append ${adhTxt} to the existing feed-meta line for the med row.
// (adh.pct === null when the med has no intervalDays and no inferable
// rhythm — in that case show nothing rather than a made-up number.)
```

### c2. Refill forecast line + "add reminder" affordance

```js
const fc = refillForecast(m, S.logs); // { dosesRemaining, runOutDate, suggestReminder }
const fcTxt = fc.runOutDate
  ? ` · ~${fc.dosesRemaining} dose${fc.dosesRemaining === 1 ? '' : 's'} left, runs out ${new Date(fc.runOutDate).toLocaleDateString()}`
  : '';
// append ${fcTxt} to the med row meta, and when fc.suggestReminder:
${fc.suggestReminder ? `<button class="btn" data-refill-rem="${m.id}">＋ Add refill reminder</button>` : ''}
```

Wire the button once after the list renders:

```js
document.querySelectorAll('[data-refill-rem]').forEach(b => b.onclick = async () => {
  const m = S.meds.find(x => x.id === b.dataset.refillRem);
  if (!m) return;
  const fc = refillForecast(m, S.logs);
  const rem = {
    id: U.id(), petId: m.petId,
    title: `Refill ${m.name}`,
    logType: 'med',
    time: '09:00',
    days: [],
    note: fc.runOutDate ? `Estimated run-out: ${new Date(fc.runOutDate).toLocaleDateString()}` : '',
    followUpMinutes: 0, followUpAt: null,
    on: true, createdAt: Date.now(),
  };
  await DB.put('reminders', rem);
  await loadAll();
  U.toast(`Refill reminder set for ${m.name}`, 'success');
});
```

(Reminder record shape matches the legacy `openRemModal` save at
legacy.js ~line 2003.)

### c3. Breed percentile line under the latest weight

```js
// in the weight section of renderHealth(), after latestW is known:
const pet = S.pets.find(p => p.id === S.activePetId);
const latestW = [...S.weights].filter(w => w.petId === pet.id).sort((a, b) => b.ts - a.ts)[0];
let breedLine = '';
if (latestW && pet) {
  const kg = (pet && null, (v => { const n = parseFloat(v); return latestW.unit === 'lbs' ? n / 2.20462 : n; })(latestW.value));
  const bp = breedPercentile(pet.species, pet.breed, kg);
  breedLine = bp
    ? `<div class="feed-meta">Breed band: ${bp.percentile}th percentile of healthy adult ${pet.breed || 'breed'} range (${bp.minKg}–${bp.maxKg} kg)</div>`
    : '';
}
// render ${breedLine} directly under the latest-weight row.
// breedPercentile returns null for "mix"/"unknown"/unmatched breeds —
// in that case render nothing.
```

### c4. "Vet Pass" button (shareable read-only report)

Place next to the existing vet-report/export button in the health view:

```html
<button class="btn" id="vetPassBtn">🔗 Vet Pass — share read-only report</button>
```

```js
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
    return U.toast(e.message, 'error'); // LZString not loaded
  }
  const url = location.origin + '/vetpass.html?d=' + payload;

  try {
    await navigator.clipboard.writeText(url);
    U.toast('Vet Pass link copied', 'success');
  } catch {
    window.prompt('Copy your Vet Pass link:', url);
  }

  // QR via the vendored qrcode-generator (window.qrcode). NOTE: 1.4.4's
  // createSvgTag takes (cellSize, margin) — not an options object.
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
```

Caveat for the coordinator: very long payloads (hundreds of logs) can
exceed QR capacity — the copy-link path always works; the QR `try/catch`
covers the failure gracefully. `vetpass.html` lives at the project root
(served at `/vetpass.html`) and decodes `?d=` with the vendored
`../js/vendor/lz-string.min.js` (classic script, with a
`js/vendor/lz-string.min.js` fallback for root-relative serving).

---

## d. Household wiring

**Target file:** `js/modules/navigation.js`
**Anchor:** the `goto(view)` switch (legacy.js ~line 593) + the import block.

```js
import { renderHousehold } from './views/household.js';

// inside goto()'s switch(view):
case 'household': renderHousehold(); break;
```

**Coordinator also inserts** (files supplied, no code to write):
1. Nav entry — from `_partials/household-snippets.html` **SNIPPET 1** into
   `<nav class="bnav" id="bnav">` in the app shell markup. NOTE: the shell
   currently has 6 nav items; adding a 7th may need a CSS tweak to
   `.bnav` (e.g. smaller labels / horizontal scroll) — check
   `css/main.css` after inserting.
2. View container — **SNIPPET 2** (`<section class="view" id="view-household">`)
   alongside the other view sections. `renderHousehold()` targets
   `#view-household` and no-ops if it is absent.

---

## e. Vet report "ANOMALY FLAGS" section

**Target file:** `js/modules/exportImport.js`
**Anchor:** end of `buildVetReport(d)` (legacy.js ~line 1764) — **this is the
cleaner anchor** (vs. the call site in `renderInsights`), because `d`
already carries `d.pet` and `d.logs` and the report assembles all its
sections there. Verify the refactored `buildInsightData` still puts the
pet's logs on `d.logs` (legacy's does — `buildFallbackNarrative` reads
`d.logs.length`).

```js
import { analyzePet } from './healthRadar.js';

// at the end of buildVetReport(d), before `return report;`:
const anomalyFlags = analyzePet(d.pet.id, d.logs || []);
if (anomalyFlags.length) {
  report += '\n\nANOMALY FLAGS (on-device, trailing 30 days — informational only, not a diagnosis):\n' +
    anomalyFlags.map(f => `  [${f.severity.toUpperCase()}] ${f.title} — ${f.detail}`).join('\n');
}
```

---

## Feature inventory (what Worker C delivered)

| # | File | Feature | Where it surfaces |
|---|------|---------|-------------------|
| 1 | `js/modules/healthRadar.js` | On-device anomaly engine (`analyzePet`) | Dashboard banner (a), Insights section (b), Vet report flags (e), Vet Pass flags |
| 2 | `js/modules/adherence.js` | `medAdherence` (14d %) + `refillForecast` (run-out date, 7-day reminder hint) | Health view med rows (c1, c2) |
| 3 | `js/modules/breedData.js` | Breed weight bands + `breedPercentile` | Health view, under latest weight (c3) |
| 4a | `js/vendor/lz-string.min.js`, `js/vendor/qrcode-generator.js` | Vendored from cdnjs (verified in node — see below) | Vet Pass share flow (c4), `vetpass.html` |
| 4b | `js/modules/vetShare.js` | `buildVetSharePayload` / `decodeVetSharePayload` | Health view Vet Pass button (c4) |
| 4c | `vetpass.html` (project root) | Standalone read-only report page (`?d=`) | Served at `/vetpass.html`, opened from shared link/QR |
| 5a | `js/modules/views/household.js` | `renderHousehold()` — all-pets today counts, alert counts, weight sparklines | New Household view (d) |
| 5b | `_partials/household-snippets.html` | Nav entry + view container snippets | Inserted by coordinator (d) |

### Vendor verification (node, 2026-10-11)
- `lz-string.min.js` (cdnjs 1.5.0): `compressToEncodedURIComponent` /
  `decompressFromEncodedURIComponent` round-tripped a 5,706-byte JSON
  string exactly (→ 665 chars). ✅
- `qrcode-generator` (cdnjs 1.4.4): `qrcode(0,'M').addData(url).make()` +
  `createSvgTag()` returned a non-empty SVG string (11,207 chars). ✅
- `node --check` passes on all new JS files (healthRadar, adherence,
  breedData, vetShare, views/household).

### Assumptions & caveats
- `js/modules/state.js` exports the named binding `S` with
  `pets/logs/reminders/weights/meds/vaccinations/notes/activePetId/settings`
  (per the guaranteed contract — not yet present; only `household.js`
  depends on it).
- Med logs carry no `medId` (legacy shape) — adherence attributes a dose
  log to a med by name-in-note, else counts all pet `med` logs
  (documented in `adherence.js`).
- Missed-med streak infers the dosing rhythm from log intervals
  (documented in `healthRadar.js`).
- Ongoing-med refill forecast assumes a 30-day supply per refill cycle
  (documented in `adherence.js`); finite courses (`until` set) use exact
  schedule math.
- Breed ranges are published breed-standard bands, kg primary; mixed /
  unknown / unmatched breeds → `null` (no invented number).
- `analyzePet` needs ≥ 7 days of history or it returns `[]` (no banner,
  no flags section).
