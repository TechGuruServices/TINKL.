// js/app.js — application bootstrap. The ONLY module allowed side effects on import.
// Assembled from legacy.js: scroll-aware nav (2492-2589), Bind (2591-2619),
// Init (2621-2656), plus relocated top-level side effects:
//   - global click delegation (legacy 751-762), calendar bindings (1507-1509),
//   - alarm interval + visibility/focus listeners (legacy 2447-2451).

import { DB } from './modules/db.js';
import { S } from './modules/state.js';
import { U, loadAll } from './modules/utils.js';
import { SYNC } from './modules/sync.js';
import { goto, currentView, render, registerView } from './modules/navigation.js';
import { renderDashboard } from './modules/views/dashboard.js';
import { renderPets } from './modules/views/pets.js';
import { renderCare } from './modules/views/careLog.js';
import { renderHealth, openMedModal, openVacModal, openWeightModal, openNoteModal } from './modules/views/health.js';
import { renderHistory, renderCalendar, renderDay } from './modules/views/history.js';
import { renderStats } from './modules/views/stats.js';
import { renderInsights } from './modules/insights.js';
import { renderHousehold } from './modules/views/household.js';
import { quickLog } from './modules/views/quickLog.js';
import { renderReminders, openRemModal } from './modules/reminders.js';
import { renderSettings, setTheme, requestNotifPermission } from './modules/settings.js';
import { showLogPicker } from './modules/views/quickLog.js';
import { openPetModal } from './modules/camera.js';
import { exportJSON, exportCSV, importJSON } from './modules/exportImport.js';
import { fireAlarm, checkAlarms, catchUpMissedAlarms, loadFiredLog } from './modules/alarms.js';
import { checkBirthdays } from './modules/birthdays.js';

// Wire every view name to its render function for modules/navigation.js.
registerView('dashboard', renderDashboard);
registerView('pets', renderPets);
registerView('care', renderCare);
registerView('health', renderHealth);
registerView('history', renderHistory);
registerView('stats', renderStats);
registerView('insights', renderInsights);
registerView('household', renderHousehold);
registerView('reminders', renderReminders);
registerView('settings', renderSettings);

/* ================ Scroll-aware nav (auto-hide bottom nav + condensing topbar) ================
   Modern pattern used by Instagram/YouTube/Airbnb mobile: the tab bar
   slides away when the user scrolls down (reading/content-focused) and
   slides back the instant they scroll up (wants navigation again).
   Implemented with a single passive scroll listener + requestAnimationFrame
   throttling and CSS transform/opacity, so it's GPU-composited and never
   triggers layout — no dependency on scroll-driven CSS animations, which
   still isn't reliably supported across every WebKit/iOS version this
   PWA targets. */
function initScrollAwareNav() {
  const bnav = document.getElementById('bnav');
  const fab = document.getElementById('fab');
  const topbar = document.querySelector('.topbar');
  if (!bnav || !topbar) return;

  const mobileQuery = window.matchMedia('(max-width: 900px)');
  const HIDE_AFTER_Y = 80;   // don't hide until the user is meaningfully into the page
  const DELTA_THRESHOLD = 8; // ignore sub-pixel/rubber-band jitter
  const CONDENSE_AFTER_Y = 20;

  // Some mobile browsers report scroll position on documentElement/body
  // instead of window depending on quirks mode / zoom state — check all three.
  function getY() {
    return Math.max(
      window.scrollY || 0,
      document.documentElement.scrollTop || 0,
      document.body.scrollTop || 0
    );
  }

  let lastY = getY();
  let hidden = false;
  let condensed = false;
  let ticking = false;

  function apply() {
    const y = getY();
    const delta = y - lastY;
    const isMobile = mobileQuery.matches;

    // Condensed topbar: turns into a glass pill once scrolled at all.
    const shouldCondense = y > CONDENSE_AFTER_Y;
    if (shouldCondense !== condensed) {
      condensed = shouldCondense;
      topbar.classList.toggle('condensed', condensed);
    }

    // Auto-hide bottom nav + FAB: mobile only (desktop sidebar stays put).
    if (isMobile) {
      let shouldHide = hidden;
      if (y <= HIDE_AFTER_Y) {
        shouldHide = false; // always visible near the top of the page
      } else if (Math.abs(delta) > DELTA_THRESHOLD) {
        shouldHide = delta > 0; // scrolling down -> hide, scrolling up -> reveal
      }
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        bnav.classList.toggle('nav-hide', hidden);
        if (fab) fab.classList.toggle('nav-hide', hidden);
      }
    } else if (hidden) {
      hidden = false;
      bnav.classList.remove('nav-hide');
      if (fab) fab.classList.remove('nav-hide');
    }

    lastY = y;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(apply);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('scroll', onScroll, { passive: true });
  mobileQuery.addEventListener('change', apply);

  // Re-evaluate whenever a view switch resets scroll to the top
  // (goto() already calls window.scrollTo(0,0) — this just syncs classes
  // immediately instead of waiting for the next scroll event).
  window.addEventListener('tinkl:view-change', apply);

  // Safari's back-forward cache (and Android app-switcher return) can
  // restore a mid-scroll page without firing a fresh scroll event —
  // resync state whenever the page becomes visible again.
  window.addEventListener('pageshow', apply);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') apply();
  });

  // Sync immediately on load instead of waiting for the first scroll
  // event, in case the browser restored a non-zero scroll position.
  apply();
}

initScrollAwareNav();

// Relocated from the Dashboard section (legacy.js 751-762): global click
// delegation for [data-del-log] deletes and [data-goto] navigation.
document.addEventListener('click', async (e) => {
  const del = e.target.closest('[data-del-log]');
  if (del) {
    if (await U.confirm('Delete log?', 'This will remove this entry permanently.')) {
      await DB.del('logs', del.dataset.delLog);
      await loadAll(); render(currentView());
      U.toast('Log deleted', 'info');
    }
  }
  const gt = e.target.closest('[data-goto]');
  if (gt) goto(gt.dataset.goto);
});

// Relocated from the History section (legacy.js 1507-1509): calendar buttons.
document.getElementById('calPrev').onclick = () => { S.calDate = new Date(S.calDate.setMonth(S.calDate.getMonth() - 1)); renderCalendar(); };
document.getElementById('calNext').onclick = () => { S.calDate = new Date(S.calDate.setMonth(S.calDate.getMonth() + 1)); renderCalendar(); };
document.getElementById('calToday').onclick = () => { S.calDate = new Date(); S.calSel = new Date(); renderCalendar(); renderDay(); };

// Relocated from legacy.js 2447-2451: alarm tick + wake-up catch-up listeners.
setInterval(checkAlarms, 15000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { catchUpMissedAlarms(); checkAlarms(); checkBirthdays(); }
});
window.addEventListener('focus', () => { catchUpMissedAlarms(); checkAlarms(); checkBirthdays(); });

/* ================ Bind ================ */
document.getElementById('addPetBtn').onclick = () => openPetModal();
document.getElementById('addLogBtn').onclick = () => showLogPicker();
document.getElementById('fab').onclick = () => showLogPicker();
document.getElementById('addRemBtn').onclick = () => openRemModal();
document.getElementById('addMedBtn').onclick = () => openMedModal();
document.getElementById('addVacBtn').onclick = () => openVacModal();
document.getElementById('addWeightBtn').onclick = () => openWeightModal();
document.getElementById('addNoteBtn').onclick = () => openNoteModal();
document.getElementById('themeBtn').onclick = () => setTheme(S.settings.theme === 'dark' ? 'light' : 'dark');
document.getElementById('notifBtn').onclick = () => goto('reminders');
document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('open');
document.getElementById('exportBtn').onclick = exportJSON;
document.getElementById('csvBtn').onclick = exportCSV;
document.getElementById('importFile').onchange = (e) => e.target.files[0] && importJSON(e.target.files[0]);
document.getElementById('resetBtn').onclick = async () => {
  if (await U.confirm('Reset everything?', 'This deletes ALL your data. Cannot be undone.')) {
    for (const s of ['pets', 'logs', 'reminders', 'weights', 'meds', 'vaccinations', 'notes']) await DB.clear(s);
    localStorage.removeItem('tinkl_settings'); localStorage.removeItem('tinkl_active');
    localStorage.removeItem('tinkl_fired_log'); localStorage.removeItem('tinkl_last_active');
    S.firedReminders.clear();
    await loadAll(); goto('dashboard'); U.toast('Reset complete', 'info');
  }
};
document.querySelectorAll('[data-view]').forEach(n => n.onclick = () => goto(n.dataset.view));
document.addEventListener('click', (e) => {
  const sb = document.getElementById('sidebar');
  if (sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('#menuBtn')) sb.classList.remove('open');
});

/* ================ Init ================ */
function updateOnlineStatus() {
  S.online = navigator.onLine;
  const bar = document.getElementById('offlineBar');
  if (bar) bar.style.display = S.online ? 'none' : 'block';
}
window.addEventListener('online', () => { updateOnlineStatus(); U.toast('Back online', 'success'); });
window.addEventListener('offline', () => { updateOnlineStatus(); U.toast('You’re offline — data still saves locally', 'info'); });

(async () => {
  await DB.init();
  await SYNC.init();
  await loadAll();
  loadFiredLog();
  setTheme(S.settings.theme || 'dark');
  goto('dashboard');
  // === LAUNCH PARAM HOOK === (coordinator inserts ?quick/?view/?source handling here)
  // Manifest shortcuts + deep links: ?quick=pee|poop (one-tap log for the
  // active pet), ?view=<name> (navigate), ?source=* (install-attribution
  // no-op). Never break boot on a malformed deep link.
  try {
    const params = new URLSearchParams(window.location.search);
    const quick = params.get('quick');
    if (quick === 'pee' || quick === 'poop') await quickLog(quick);
    const view = params.get('view');
    if (view && document.getElementById('view-' + view)) goto(view);
  } catch (err) { /* ignore malformed launch params */ }
  updateOnlineStatus();
  catchUpMissedAlarms();
  checkAlarms();
  checkBirthdays();
  if (S.settings.notifications && 'Notification' in window && Notification.permission === 'default') {
    setTimeout(requestNotifPermission, 4000);
  }
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      if (reg && reg.update) reg.update().catch(() => { });
      navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'notif-action' && e.data.tag) {
          const r = S.reminders.find(x => x.id === e.data.tag);
          if (r) fireAlarm(r);
        }
        // Background-sync flush: the SW nudges us when connectivity returns
        // after we queued a 'tinkl-backup' sync while offline.
        if (e.data && e.data.type === 'tinkl-flush-backup') {
          SYNC.pushToCloud().catch(() => {});
        }
        if (e.data && e.data.type === 'tinkl-open-url' && e.data.url) {
          try {
            const u = new URL(e.data.url, window.location.origin);
            if (u.origin === window.location.origin) {
              const v = u.searchParams.get('view');
              if (v) goto(v); else window.location.href = u.href;
            }
          } catch (err) { /* ignore malformed SW messages */ }
        }
      });
    } catch (e) { }
  }
})();
