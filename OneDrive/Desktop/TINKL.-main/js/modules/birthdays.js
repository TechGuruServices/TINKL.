// Birthdays — legacy.js lines 2393-2446 and 2454-2462.
// (The alarm setInterval + visibility/focus listeners at legacy lines 2447-2451 moved to js/app.js.)

import { S } from './state.js';
import { U } from './utils.js';
import { inQuietHours } from './settings.js';

/* ================ Birthdays ================ */
// Fires a one-time-per-year notification when today matches a pet's
// stored birthday (month + day). Dedup is keyed by pet+year so it can
// never double-fire on reload, and reuses the existing notification /
// quiet-hours plumbing rather than a separate ad-hoc path.
function loadFiredBirthdaysLog() {
  try {
    const raw = localStorage.getItem('tinkl_fired_birthdays');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) { return new Set(); }
}
function saveFiredBirthdaysLog(set) {
  try { localStorage.setItem('tinkl_fired_birthdays', JSON.stringify([...set])); } catch (e) { }
}
function checkBirthdays() {
  if (!S.settings.notifications) return;
  const today = new Date();
  const fired = loadFiredBirthdaysLog();
  let firedAny = false;
  S.pets.forEach(p => {
    if (!p.birthday) return;
    const bday = new Date(p.birthday);
    if (Number.isNaN(bday.getTime())) return;
    if (bday.getMonth() !== today.getMonth() || bday.getDate() !== today.getDate()) return;
    const key = p.id + '|' + today.getFullYear();
    if (fired.has(key)) return;
    fired.add(key);
    firedAny = true;
    const quiet = inQuietHours();
    if (!quiet) {
      if (S.settings.vibration && navigator.vibrate) navigator.vibrate([160, 80, 160, 80, 240]);
      if (S.settings.sound) beep();
      showBirthdayNotification(p);
    }
    U.toast(`🎉 Happy Birthday, ${p.name}!`, 'success');
  });
  if (firedAny) saveFiredBirthdaysLog(fired);
}
async function showBirthdayNotification(p) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = {
    body: `Hope ${p.name}${p.breed ? ` the ${p.breed}` : ''} has a great day! 🎉`,
    icon: '/tinkl-logo-paw3-192.png', badge: '/tinkl-logo-paw3-192.png',
    tag: 'birthday-' + p.id, renotify: true,
  };
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) { await reg.showNotification(`🎂 Happy Birthday, ${p.name}!`, opts); return; }
    }
    new Notification(`🎂 Happy Birthday, ${p.name}!`, opts);
  } catch (e) { }
}

function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const o = c.createOscillator(); const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = 880; g.gain.value = 0.08;
    o.start(); setTimeout(() => { o.frequency.value = 1180; }, 120); setTimeout(() => { o.stop(); c.close(); }, 300);
  } catch (e) { }
}

export { loadFiredBirthdaysLog, saveFiredBirthdaysLog, checkBirthdays, showBirthdayNotification, beep };
