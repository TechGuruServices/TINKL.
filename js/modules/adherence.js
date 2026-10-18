/* ============================================================================
 * adherence.js — medication adherence + refill forecasting for the Tinkle PWA.
 *
 * Zero imports. Pure functions over plain data. Deterministic.
 *
 * MED SHAPE (from the med form in js/legacy.js, ~lines 1278-1320):
 *   { id, petId, name, dose, schedule (free text, e.g. "1x daily, morning"),
 *     start (date string), until (optional date string),
 *     intervalDays (optional number — doses due every N days from `start`) }
 * Log shape: { id, petId, type, ts, note } — med doses are type 'med'.
 *
 * SCHEDULE-PATTERN ASSUMPTIONS:
 * 1. A med is "scheduled" when it has a positive numeric `intervalDays`
 *    (doses due every intervalDays from `start`). This is the same model
 *    legacy.js uses in calculateNextMedDue (~line 1133).
 * 2. If intervalDays is missing/zero, the cadence is inferred from the
 *    MEDIAN interval between consecutive 'med'-type logs for the pet over
 *    the trailing 60 days (needs >= 3 logs, i.e. >= 2 gaps). This assumes
 *    one dominant dosing rhythm and consistent logging.
 * 3. LOG↔MED LINKAGE: med logs have no medId in the legacy shape, so a log
 *    is attributed to a med when its `note` contains the med's name
 *    (case-insensitive, name >= 3 chars). If NO log in the lookback window
 *    names the med, all of the pet's 'med' logs count — the single-med
 *    household default. Multi-med households that log doses without naming
 *    them will over-count; naming doses in the note is the fix.
 * 4. REFILL MODEL:
 *    - Finite course (med.until set): exact schedule math — total expected
 *      doses from start..until, minus doses logged since start.
 *    - Ongoing meds (no until): assumes a 30-day supply dispensed per
 *      refill cycle anchored at med.start (or first logged dose), with one
 *      cycle lasting max(intervalDays, 30) days. E.g. a monthly flea med
 *      (intervalDays=30) -> 1 dose per 30-day cycle; a daily med
 *      (intervalDays=1) -> 30 doses per cycle. This is a heuristic —
 *      actual dispensed quantities vary by vet/pharmacy.
 * ========================================================================== */

const DAY = 86400000;

function safeNum(v, fb = 0) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : fb;
}

/** Logs of type 'med' for this pet, newest-last. */
function petMedLogs(med, logs) {
  const all = (Array.isArray(logs) ? logs : [])
    .filter(l => l && l.petId === med.petId && l.type === 'med' && typeof l.ts === 'number')
    .sort((a, b) => a.ts - b.ts);
  const name = String(med.name || '').trim().toLowerCase();
  if (name.length >= 3) {
    const named = all.filter(l => String(l.note || '').toLowerCase().includes(name));
    if (named.length) return named;
  }
  return all; // single-med default: every unnamed 'med' log counts
}

/** Cadence in days: explicit intervalDays, else inferred from log rhythm. */
function cadenceDays(med, medLogs, now) {
  const explicit = safeNum(med.intervalDays, 0);
  if (explicit > 0) return explicit;
  const recent = medLogs.filter(l => l.ts >= now - 60 * DAY).map(l => l.ts);
  if (recent.length >= 3) {
    const gaps = [];
    for (let i = 1; i < recent.length; i++) gaps.push((recent[i] - recent[i - 1]) / DAY);
    gaps.sort((a, b) => a - b);
    const m = gaps.length % 2 ? gaps[gaps.length >> 1]
      : (gaps[(gaps.length >> 1) - 1] + gaps[gaps.length >> 1]) / 2;
    if (m > 0 && m <= 120) return m;
  }
  return 0; // undeterminable
}

/** Scheduled dose times (ms) in [from, to], anchored at start, capped by until. */
function doseTimes(startMs, intervalDays, from, to, untilMs) {
  const out = [];
  if (!startMs || !(intervalDays > 0)) return out;
  const step = intervalDays * DAY;
  const end = Math.min(to, untilMs || to);
  // first dose time >= from
  let k = startMs >= from ? 0 : Math.ceil((from - startMs) / step);
  for (let t = startMs + k * step; t <= end + 1; t += step) out.push(t);
  return out;
}

function parseDate(v) {
  if (v == null) return 0;
  const t = v instanceof Date ? v.getTime() : new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

/* ------------------------------------------------------------------ */
/** Doses logged vs scheduled over the trailing `days` (default 14).
 *  Returns { pct, expected, taken }. pct is null when the schedule is
 *  undeterminable (no intervalDays and no inferable rhythm). */
export function medAdherence(med, logs, days = 14) {
  if (!med || !med.petId) return { pct: null, expected: 0, taken: 0 };
  const now = Date.now();
  const from = now - safeNum(days, 14) * DAY;
  const medLogs = petMedLogs(med, logs);
  const taken = medLogs.filter(l => l.ts >= from).length;
  const cad = cadenceDays(med, medLogs, now);
  if (!(cad > 0)) return { pct: null, expected: 0, taken };
  const start = parseDate(med.start) || (medLogs.length ? medLogs[0].ts : 0);
  const until = parseDate(med.until);
  const expected = doseTimes(start, cad, from, now, until).length;
  return {
    pct: expected > 0 ? Math.round((taken / expected) * 100) : null,
    expected,
    taken,
  };
}

/* ------------------------------------------------------------------ */
/** Estimate remaining supply and run-out date.
 *  Returns { dosesRemaining, runOutDate (ms|null), suggestReminder (bool) }.
 *  suggestReminder is true when the supply runs out within the next 7 days
 *  (the caller can offer an "add reminder" affordance). */
export function refillForecast(med, logs, now = Date.now()) {
  if (!med || !med.petId) return { dosesRemaining: null, runOutDate: null, suggestReminder: false };
  const medLogs = petMedLogs(med, logs);
  const cad = cadenceDays(med, medLogs, now);
  if (!(cad > 0)) return { dosesRemaining: null, runOutDate: null, suggestReminder: false };

  const start = parseDate(med.start) || (medLogs.length ? medLogs[0].ts : 0);
  const until = parseDate(med.until);

  // ---- Finite course: exact schedule math ----
  if (until > start) {
    const times = doseTimes(start, cad, start, until, until);
    const total = times.length;
    const taken = medLogs.filter(l => l.ts >= start - 1).length;
    const remaining = Math.max(0, total - taken);
    const runOutDate = total ? times[total - 1] : null;
    return {
      dosesRemaining: remaining,
      runOutDate,
      suggestReminder: remaining > 0 && runOutDate != null && (runOutDate - now) <= 7 * DAY,
    };
  }

  // ---- Ongoing med: 30-day-supply heuristic (see header assumption 4) ----
  // Require a recent signal so ancient one-off meds don't nag forever.
  const recent = medLogs.some(l => now - l.ts <= 60 * DAY);
  const anchored = start && (now - start) <= 365 * DAY;
  if (!recent && !anchored) return { dosesRemaining: null, runOutDate: null, suggestReminder: false };

  const cycleDays = Math.max(cad, 30);
  const anchor = start || (medLogs.length ? medLogs[0].ts : now);
  const dosesPerCycle = Math.max(1, Math.round(cycleDays / cad));
  const cycleStart = anchor + Math.floor((now - anchor) / (cycleDays * DAY)) * cycleDays * DAY;
  const takenInCycle = medLogs.filter(l => l.ts >= cycleStart).length;
  const remaining = Math.max(0, dosesPerCycle - takenInCycle);
  const runOutDate = cycleStart + cycleDays * DAY;
  return {
    dosesRemaining: remaining,
    runOutDate,
    suggestReminder: (runOutDate - now) <= 7 * DAY,
  };
}
