// Alarm firing + alarm loop — legacy.js lines 2206-2262 and 2264-2391.
// (The setInterval + visibility/focus listeners at legacy lines 2447-2451 moved to js/app.js.)

import { DB } from './db.js';
import { S } from './state.js';
import { U, loadAll } from './utils.js';
import { LOG_TYPES } from './logTypes.js';
import { openModal } from './modal.js';
import { render, currentView } from './navigation.js';
import { formatDays } from './reminders.js';
import { inQuietHours, showAlarmNotification } from './settings.js';
import { beep } from './birthdays.js';

/* ================ Alarm firing ================ */
function fireAlarm(r, isFollowUp = false) {
  if (S.activeAlarms.has(r.id)) return;
  S.activeAlarms.add(r.id);
  const emoji = LOG_TYPES[r.logType]?.emoji || '⏰';
  const label = LOG_TYPES[r.logType]?.label || 'care';
  const quiet = inQuietHours();

  // Per-reminder auto follow-up: if this reminder has one configured,
  // schedule it the moment the alarm fires — independent of whatever
  // the user does with this popup (skip/snooze/ignore). Only "Done"
  // cancels it, since the task's been taken care of. This is separate
  // from the global manual Snooze button/minutes.
  if (!isFollowUp && r.followUpMinutes) {
    r.followUpAt = Date.now() + r.followUpMinutes * 60000;
    DB.put('reminders', r).catch(() => { });
  }

  if (!quiet) {
    if (S.settings.vibration && navigator.vibrate) navigator.vibrate([160, 80, 160, 80, 240]);
    if (S.settings.sound) beep();
    showAlarmNotification(r, label, false, isFollowUp);
  }

  openModal({
    title: `${emoji} ${isFollowUp ? 'Still need to: ' : ''}${r.title}`,
    body: `
  <p class="text-mut" style="margin:0 0 4px">${U.esc(r.note || 'Time for ' + label + '.')}</p>
  <p class="text-mut" style="font-size:0.8rem;margin:0">${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · ${formatDays(r.days)}${quiet ? ' · 🌙 quiet hours' : ''}${isFollowUp ? ' · follow-up reminder' : ''}</p>
`,
    actions: [
      { label: `⏭ Skip`, kind: 'secondary', v: 'skip' },
      { label: `⏰ Snooze ${S.settings.snoozeMinutes}m`, kind: 'secondary', v: 'snooze' },
      { label: `✅ Done`, kind: 'primary', v: 'done' },
    ],
    onAction: async (v, close) => {
      S.activeAlarms.delete(r.id);
      if (v === 'snooze') {
        r.snoozedUntil = Date.now() + S.settings.snoozeMinutes * 60000;
        await DB.put('reminders', r);
        U.toast(`Snoozed ${S.settings.snoozeMinutes} min`, 'info');
      } else if (v === 'skip') {
        U.toast('Skipped this occurrence', 'info');
      } else if (v === 'done') {
        if (r.logType && LOG_TYPES[r.logType]) {
          await DB.put('logs', { id: U.id(), petId: r.petId || S.activePetId, type: r.logType, ts: Date.now(), note: `Auto-logged from “${r.title}”` });
          await loadAll();
        }
        // Task is done — cancel any pending auto follow-up for this reminder
        if (r.followUpAt) { r.followUpAt = null; await DB.put('reminders', r); }
        U.toast(`Logged ${label}`, 'success');
      }
      render(currentView());
      close();
    },
  });
}

/* ================ Alarm loop ================ */
// Fired-reminder de-dup state persists across reloads (same day only),
// since S.firedReminders is in-memory and would otherwise reset every
// time the page reloads (e.g. iOS reloading a suspended background tab).
function loadFiredLog() {
  try {
    const raw = localStorage.getItem('tinkl_fired_log');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && data.date === new Date().toDateString() && Array.isArray(data.ids)) {
      data.ids.forEach(id => S.firedReminders.add(id));
    }
  } catch (e) { }
}
function saveFiredLog() {
  try {
    localStorage.setItem('tinkl_fired_log', JSON.stringify({ date: new Date().toDateString(), ids: [...S.firedReminders] }));
  } catch (e) { }
}

function checkAlarms() {
  if (!S.settings.notifications) return;
  const now = new Date();
  const key = now.toDateString() + '|' + now.getHours() + ':' + now.getMinutes();
  let firedAny = false;
  S.reminders.filter(r => r.on).forEach(r => {
    if (S.settings.mutedTypes && S.settings.mutedTypes.includes(r.logType)) return;

    // ── Per-reminder auto follow-up ──────────────────────────────────────
    // followUpAt is a concrete epoch timestamp set by fireAlarm() the
    // moment the *original* alarm fires. If it has elapsed and hasn't
    // been cleared by the user hitting "Done", fire a follow-up alarm
    // and then clear the timestamp so it doesn't keep re-firing.
    if (r.followUpAt && r.followUpAt <= Date.now()) {
      const fk = r.id + '|followup|' + r.followUpAt;
      if (!S.firedReminders.has(fk)) {
        S.firedReminders.add(fk);
        firedAny = true;
        r.followUpAt = null;                          // clear so it won't re-fire
        DB.put('reminders', r).catch(() => { });
        fireAlarm(r, true);                           // isFollowUp = true
      }
      return; // don't also check scheduled time this same tick
    }

    // ── Snooze (manual, global) ──────────────────────────────────────────
    if (r.snoozedUntil && r.snoozedUntil > Date.now()) return;
    let due = false;
    if (r.snoozedUntil && r.snoozedUntil <= Date.now()) {
      due = true;
      r.snoozedUntil = null;
      DB.put('reminders', r).catch(() => { });
    } else {
      // ── Scheduled time ────────────────────────────────────────────────
      const [h, mi] = r.time.split(':').map(Number);
      if (h === now.getHours() && mi === now.getMinutes() && (!r.days || r.days.includes(now.getDay()))) due = true;
    }
    if (!due) return;
    const fk = r.id + '|' + key;
    if (S.firedReminders.has(fk)) return;
    S.firedReminders.add(fk);
    firedAny = true;
    fireAlarm(r, false);
  });
  if (firedAny) saveFiredLog();
  localStorage.setItem('tinkl_last_active', String(Date.now()));
}

// Mobile browsers throttle or fully suspend JS timers while the tab is
// backgrounded or the device is locked — most aggressively on iOS. That
// means a reminder due at 3:00pm while the phone was locked simply never
// fires. There's no way to run real background alarms without a native
// push server, but we can at least catch up gracefully: when the app
// becomes active again, look back over the gap and surface anything
// that was missed instead of silently losing it.
function catchUpMissedAlarms() {
  if (!S.settings.notifications) return;
  const lastStr = localStorage.getItem('tinkl_last_active');
  const now = Date.now();
  if (!lastStr) { localStorage.setItem('tinkl_last_active', String(now)); return; }
  const last = +lastStr;
  const gapMs = now - last;
  if (gapMs < 30000) return;
  const lookbackMs = Math.min(gapMs, 12 * 3600000);
  const from = now - lookbackMs;
  let missed = [];
  S.reminders.filter(r => r.on).forEach(r => {
    if (S.settings.mutedTypes && S.settings.mutedTypes.includes(r.logType)) return;

    // ── Missed follow-up ─────────────────────────────────────────────────
    // If the tab was asleep when a follow-up timestamp elapsed, surface it
    // now on wake-up. Clear followUpAt so it can't fire a second time.
    if (r.followUpAt && r.followUpAt > from && r.followUpAt <= now) {
      const fk = r.id + '|followup|' + r.followUpAt;
      if (!S.firedReminders.has(fk)) {
        S.firedReminders.add(fk);
        missed.push({ r, isFollowUp: true });
        r.followUpAt = null;
        DB.put('reminders', r).catch(() => { });
      }
      return;
    }

    // ── Missed scheduled alarm ───────────────────────────────────────────
    const [h, mi] = (r.time || '00:00').split(':').map(Number);
    for (let i = 0; i < 2; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(h, mi, 0, 0);
      const t = d.getTime();
      if (t > now - 60000 || t < from) continue;
      if (!r.days || r.days.includes(d.getDay())) {
        const fk = r.id + '|' + d.toDateString() + '|' + h + ':' + mi;
        if (!S.firedReminders.has(fk)) {
          S.firedReminders.add(fk);
          missed.push({ r, isFollowUp: false });
        }
        break;
      }
    }
  });
  if (missed.length) {
    saveFiredLog();
    const label = missed.length === 1
      ? `Missed "${missed[0].r.title}"${missed[0].isFollowUp ? ' (follow-up)' : ''} while away`
      : `Missed ${missed.length} reminders while away`;
    U.toast(label, 'info');
  }
  localStorage.setItem('tinkl_last_active', String(now));
}

export { fireAlarm, loadFiredLog, saveFiredLog, checkAlarms, catchUpMissedAlarms };
