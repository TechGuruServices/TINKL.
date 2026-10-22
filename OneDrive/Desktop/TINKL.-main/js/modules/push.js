/* ============================================================================
 * push.js — Web Push client wiring (Cloudflare Worker backend)
 * ----------------------------------------------------------------------------
 * Backend API (already live on the Worker):
 *   GET    {WORKER_URL}/api/push/vapid-public-key  -> { key }   (no auth)
 *   POST   {WORKER_URL}/api/push/subscribe          -> { subscription } + Bearer auth
 *   DELETE {WORKER_URL}/api/push/subscribe          -> { endpoint }     + Bearer auth
 * The service worker (sw.js) already handles 'push' events and deep-links
 * notification taps via data.url — no SW changes needed here.
 * WORKER_URL and the per-device sync credential are reused from sync.js (SYNC config).
 * ========================================================================== */

import { SYNC } from './sync.js';

// VAPID public key, cached in memory after the first fetch.
let cachedVapidKey = null;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function getRegistration() {
  if (!('serviceWorker' in navigator)) throw new Error('no-service-worker');
  return navigator.serviceWorker.ready;
}

/** Fetch (and in-memory cache) the Worker's VAPID public key. */
export async function getVapidKey() {
  if (cachedVapidKey) return cachedVapidKey;
  const res = await fetch(`${SYNC.WORKER_URL}/api/push/vapid-public-key`);
  if (!res.ok) throw new Error('vapid-key-fetch-failed:' + res.status);
  const data = await res.json();
  if (!data || !data.key) throw new Error('vapid-key-missing');
  cachedVapidKey = data.key;
  return cachedVapidKey;
}

/** True when a push subscription currently exists. Never throws. */
export async function isSubscribed() {
  try {
    const reg = await getRegistration();
    if (!reg.pushManager) return false;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch (err) {
    return false;
  }
}

/**
 * Full subscribe flow: permission -> pushManager.subscribe -> register with
 * the Worker. Throws on permission denial, missing VAPID key, or network
 * failure (rolls back the local subscription on server-register failure so
 * local/remote state never diverges). Returns the PushSubscription.
 */
export async function subscribe() {
  if (!('Notification' in window)) throw new Error('notifications-unsupported');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('permission-denied');
  const key = await getVapidKey();
  const reg = await getRegistration();
  if (!reg.pushManager) throw new Error('push-unsupported');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });
  const res = await fetch(`${SYNC.WORKER_URL}/api/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SYNC.getCredential()}`,
    },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });
  if (!res.ok) {
    await sub.unsubscribe().catch(() => {});
    throw new Error('subscribe-register-failed:' + res.status);
  }
  return sub;
}

/**
 * Unsubscribe locally and remove the subscription server-side.
 * Returns true when a subscription existed and was removed.
 */
export async function unsubscribe() {
  const reg = await getRegistration();
  const sub = reg.pushManager ? await reg.pushManager.getSubscription() : null;
  if (!sub) return false;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  try {
    await fetch(`${SYNC.WORKER_URL}/api/push/subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SYNC.getCredential()}`,
      },
      body: JSON.stringify({ endpoint }),
    });
  } catch (err) {
    // Server-side cleanup is best-effort; the local unsubscribe already
    // stops all push delivery to this device.
  }
  return true;
}
