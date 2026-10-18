/* ============================================================================
 * healthRadar.js — on-device anomaly engine for the Tinkle PWA.
 *
 * Zero imports. Pure functions over plain data. Deterministic (no network,
 * no clock beyond the injectable `now` param).
 *
 * analyzePet(petId, logs, now?) -> Array<{
 *   type, severity: 'info'|'warn'|'urgent', title, detail, ts
 * }>
 *
 * LOG-TYPE STRING ASSUMPTIONS (from LOG_TYPES in js/legacy.js, ~line 191):
 *   'pee' | 'poop' | 'accident' | 'feed' | 'water' | 'walk' |
 *   'med' | 'play' | 'bath' | 'groom'
 * Log record shape: { id, petId, type, ts (ms epoch), note }.
 *
 * MED-STREAK ASSUMPTION: med logs carry NO medId in the legacy shape, so a
 * dosing schedule cannot be matched 1:1 with a medication. Instead the
 * cadence is inferred from the MEDIAN interval between consecutive 'med'
 * logs for the pet over the trailing 30 days (needs >= 4 med logs). A
 * "missed streak" = >= 2 consecutive inferred dose-times that passed with
 * no log. This assumes regular dosing + consistent logging and cannot
 * distinguish between multiple concurrent meds — it is a nudge to check,
 * never a diagnosis.
 *
 * GUARD: needs >= 7 days of history for the pet to build baselines,
 * otherwise returns [].
 * ========================================================================== */

const DAY = 86400000;

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function fmtDur(ms) {
  const h = ms / 3600000;
  if (h < 1) return Math.round(ms / 60000) + 'm';
  if (h < 48) return (Math.round(h * 10) / 10) + 'h';
  return Math.round(h / 24) + 'd';
}

function inRange(ts, from, to) { return ts >= from && ts < to; }

/** Count timestamps in [from, to). Takes an array of ms-epoch numbers. */
function countIn(tsArr, from, to) {
  let n = 0;
  for (const ts of tsArr) if (inRange(ts, from, to)) n++;
  return n;
}

/** median interval (ms) between consecutive events in a sorted ts array */
function medianInterval(sortedTs) {
  if (sortedTs.length < 2) return 0;
  const gaps = [];
  for (let i = 1; i < sortedTs.length; i++) gaps.push(sortedTs[i] - sortedTs[i - 1]);
  return median(gaps);
}

/** median daily count over the trailing 30 days */
function medianDailyCount(sortedTs, now) {
  const counts = [];
  for (let d = 0; d < 30; d++) {
    counts.push(countIn(sortedTs, now - (d + 1) * DAY, now - d * DAY));
  }
  return median(counts);
}

const SEV_ORDER = { urgent: 0, warn: 1, info: 2 };

export function analyzePet(petId, logs, now = Date.now()) {
  if (!petId || !Array.isArray(logs)) return [];
  const plogs = logs.filter(l => l && l.petId === petId && typeof l.ts === 'number' && l.ts <= now);
  if (plogs.length < 2) return [];

  const earliest = Math.min(...plogs.map(l => l.ts));
  if ((now - earliest) / DAY < 7) return []; // need >= 7 days of history for baselines

  const byType = {};
  for (const l of plogs) {
    if (typeof l.type !== 'string') continue;
    (byType[l.type] = byType[l.type] || []).push(l.ts);
  }
  for (const t of Object.keys(byType)) byType[t].sort((a, b) => a - b);

  const win = now - 30 * DAY; // trailing-30d baseline window
  const flags = [];
  const push = (type, severity, title, detail, ts) =>
    flags.push({ type, severity, title, detail, ts });

  // ---- 1. no-poop: time since last poop vs baseline median poop interval ----
  const poop = (byType.poop || []).filter(ts => ts >= win);
  if (poop.length >= 2) {
    const base = medianInterval(poop);
    if (base > 0) {
      const since = now - poop[poop.length - 1];
      if (since > 3 * base) {
        push('no-poop', 'urgent', 'No poop in a while',
          `Last poop ${fmtDur(since)} ago — usual gap is ~${fmtDur(base)}. If this continues, check in with your vet.`,
          poop[poop.length - 1]);
      } else if (since > 1.8 * base) {
        push('no-poop', 'warn', 'Poop is overdue',
          `Last poop ${fmtDur(since)} ago vs a usual gap of ~${fmtDur(base)}.`,
          poop[poop.length - 1]);
      }
    }
  }

  // ---- 2. water / feed down > 40% week-over-week ----
  for (const t of ['water', 'feed']) {
    const ts = byType[t] || [];
    const thisW = countIn(ts, now - 7 * DAY, now);
    const prevW = countIn(ts, now - 14 * DAY, now - 7 * DAY);
    if (prevW >= 3 && (prevW - thisW) / prevW > 0.40) {
      const pct = Math.round(((prevW - thisW) / prevW) * 100);
      push(t + '-drop', 'warn', `${t === 'water' ? 'Water' : 'Food'} intake down`,
        `${thisW} ${t} logs this week vs ${prevW} last week (−${pct}%).`,
        now);
    }
  }

  // ---- 3. accident spike ----
  const acc = byType.accident || [];
  const w0 = countIn(acc, now - 7 * DAY, now);
  const priorWeeks = [1, 2, 3, 4].map(w => countIn(acc, now - (w + 1) * 7 * DAY, now - w * 7 * DAY));
  const threshold = Math.max(2, 2 * median(priorWeeks));
  if (w0 >= threshold) {
    push('accident-spike', 'warn', 'Accident spike',
      `${w0} accident${w0 === 1 ? '' : 's'} this week (typical: ≤${Math.floor(threshold)}). ` +
      `Rule out schedule changes, stress, or a vet check if it persists.`,
      now);
  }

  // ---- 4. missed-med streak (>= 2 consecutive inferred doses missed) ----
  const meds = (byType.med || []).filter(ts => ts >= win);
  if (meds.length >= 4) {
    const doseGap = medianInterval(meds);
    if (doseGap > 0) {
      const streak = Math.floor((now - meds[meds.length - 1]) / doseGap);
      if (streak >= 2) {
        push('missed-med', 'urgent', 'Missed medication doses',
          `~${streak} expected doses missed based on the usual every-${fmtDur(doseGap)} rhythm. ` +
          `Schedules are inferred from past logs — confirm against the actual prescription.`,
          meds[meds.length - 1]);
      }
    }
  }

  // ---- 5. no logs at all for 48h while the pet normally logs daily ----
  const allTs = plogs.map(l => l.ts).sort((a, b) => a - b);
  const dailyMed = medianDailyCount(allTs, now);
  const lastAny = allTs[allTs.length - 1];
  if (dailyMed >= 1 && now - lastAny > 48 * 3600000) {
    push('no-activity', 'info', 'No logs in 2+ days',
      `This pet usually has activity logged daily — last entry was ${fmtDur(now - lastAny)} ago.`,
      lastAny);
  }

  flags.sort((a, b) => (SEV_ORDER[a.severity] - SEV_ORDER[b.severity]) || (b.ts - a.ts));
  return flags;
}
