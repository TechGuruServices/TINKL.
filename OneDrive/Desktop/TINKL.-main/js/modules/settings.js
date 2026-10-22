// Settings — extracted from legacy.js lines 2095-2204.

import { S } from './state.js';
import { U, saveSettings } from './utils.js';
import { Icon } from './icons.js';
import { LOG_TYPES } from './logTypes.js';
import { SYNC } from './sync.js';
import { render, currentView } from './navigation.js';
import { isSubscribed, subscribe, unsubscribe } from './push.js';

/* ================ Settings ================ */
function renderSettings() {
  document.querySelectorAll('[data-set-theme]').forEach(b => {
    b.classList.toggle('active', b.dataset.setTheme === S.settings.theme);
    b.onclick = () => setTheme(b.dataset.setTheme);
  });
  const bindSw = (id, key, extra) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('on', !!S.settings[key]);
    el.onclick = async () => {
      S.settings[key] = !S.settings[key];
      saveSettings(); renderSettings();
      if (extra) await extra();
    };
  };
  bindSw('notifSw', 'notifications', async () => { if (S.settings.notifications) await requestNotifPermission(); });
  // Web Push toggle (differentiator): subscription state lives in the push
  // subscription itself, not S.settings. The switch only flips on success;
  // on failure it stays as-is (revert) and a toast explains why.
  const pushEl = document.getElementById('pushSw');
  if (pushEl) {
    isSubscribed().then(on => pushEl.classList.toggle('on', !!on));
    pushEl.onclick = async () => {
      const wantOn = !pushEl.classList.contains('on');
      try {
        if (wantOn) {
          await subscribe();
          pushEl.classList.add('on');
          U.toast('Push notifications enabled', 'success');
        } else {
          await unsubscribe();
          pushEl.classList.remove('on');
          U.toast('Push notifications disabled', 'info');
        }
      } catch (err) {
        const code = err && err.message;
        U.toast(
          code === 'permission-denied' ? 'Notification permission was denied'
          : code === 'notifications-unsupported' ? 'Notifications are not supported on this device'
          : 'Push setup failed' + (code ? ': ' + code : ''),
          'error'
        );
      }
    };
  }
  bindSw('soundSw', 'sound');
  bindSw('vibSw', 'vibration', async () => { if (S.settings.vibration && navigator.vibrate) navigator.vibrate(60); });
  bindSw('quietSw', 'quietHours');

  const snz = document.getElementById('snoozeSel');
  if (snz) { snz.value = String(S.settings.snoozeMinutes); snz.onchange = () => { S.settings.snoozeMinutes = +snz.value; saveSettings(); }; }
  const qs = document.getElementById('quietStart'), qe = document.getElementById('quietEnd');
  if (qs) { qs.value = S.settings.quietStart; qs.onchange = () => { S.settings.quietStart = qs.value; saveSettings(); }; }
  if (qe) { qe.value = S.settings.quietEnd; qe.onchange = () => { S.settings.quietEnd = qe.value; saveSettings(); }; }
  const qr = document.getElementById('quietRow');
  if (qr) qr.style.opacity = S.settings.quietHours ? '1' : '0.4';

  const mt = document.getElementById('muteTypes');
  if (mt) {
    const muted = new Set(S.settings.mutedTypes || []);
    mt.innerHTML = Object.keys(LOG_TYPES).map(k => {
      const on = muted.has(k);
      return `<button type="button" class="chart-tab ${on ? '' : 'active'}" data-mute="${k}" style="flex:0 1 auto">${Icon(LOG_TYPES[k].icon)} ${LOG_TYPES[k].label}${on ? ' ' + Icon('bellOff') : ''}</button>`;
    }).join('');
    mt.querySelectorAll('[data-mute]').forEach(b => b.onclick = () => {
      const k = b.dataset.mute;
      if (muted.has(k)) muted.delete(k); else muted.add(k);
      S.settings.mutedTypes = [...muted]; saveSettings(); renderSettings();
    });
  }

  // Cloud sync buttons
  const pushBtn = document.getElementById('syncPushBtn');
  if (pushBtn) pushBtn.onclick = () => SYNC.pushToCloud();

  const pullBtn = document.getElementById('syncPullBtn');
  if (pullBtn) pullBtn.onclick = () => SYNC.restoreFromCloud();

  const delBtn = document.getElementById('syncDelBtn');
  if (delBtn) delBtn.onclick = () => SYNC.deleteCloudBackup();

  const syncStatus = document.getElementById('syncStatus');
  if (syncStatus) {
    const lastPush = Number(localStorage.getItem('tinkl_last_sync_push') || 0);
    syncStatus.textContent = lastPush === 0 ? 'never' : U.rel(lastPush);
  }
}
function setTheme(t) {
  S.settings.theme = t; document.body.setAttribute('data-theme', t); saveSettings();
  const icons = { dark: Icon('moon'), light: Icon('sun'), aurora: Icon('sparkle'), sunset: Icon('sunset'), midnight: Icon('stars'), nebula: Icon('comet'), blossom: Icon('gem'), abyss: Icon('wave') };
  document.getElementById('themeBtn').innerHTML = icons[t] || Icon('moon');
  const metaColors = { dark: '#0b0d16', light: '#f2f4fb', aurora: '#04120f', sunset: '#170a12', midnight: '#060714', nebula: '#0a0618', blossom: '#1a0e14', abyss: '#020c14' };
  document.querySelector('meta[name="theme-color"]').setAttribute('content', metaColors[t] || '#0b0d16');
  renderSettings(); render(currentView());
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') { U.toast('Notifications are blocked in browser settings', 'error'); return false; }
  try {
    const p = await Notification.requestPermission();
    if (p === 'granted') { U.toast('Notifications enabled', 'success'); return true; }
  } catch (e) { }
  return false;
}

// iOS Home Screen PWAs (iOS 16.4+) only reliably support notifications
// fired through a ServiceWorkerRegistration, not the bare `new
// Notification()` constructor. Prefer the SW path everywhere; fall back
// to the constructor for browsers/contexts without an active SW.
async function showAlarmNotification(r, label, quiet) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = {
    body: (r.note || 'Time for ' + label) + ' — tap for options',
    icon: '/tinkl-logo-paw3-192.png', badge: '/tinkl-logo-paw3-192.png',
    tag: r.id, renotify: true, silent: !!quiet,
  };
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification('TINKL · ' + r.title, opts);
        return;
      }
    }
    new Notification('TINKL · ' + r.title, opts);
  } catch (e) { }
}

function inQuietHours(d = new Date()) {
  if (!S.settings.quietHours) return false;
  const [sh, sm] = (S.settings.quietStart || '22:00').split(':').map(Number);
  const [eh, em] = (S.settings.quietEnd || '07:00').split(':').map(Number);
  const cur = d.getHours() * 60 + d.getMinutes();
  const s = sh * 60 + sm, e = eh * 60 + em;
  return s === e ? false : s < e ? (cur >= s && cur < e) : (cur >= s || cur < e);
}

export { renderSettings, setTheme, requestNotifPermission, showAlarmNotification, inQuietHours };
