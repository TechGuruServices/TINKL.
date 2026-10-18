/* ============================================================================
 * TINKL. — Production Service Worker
 * ----------------------------------------------------------------------------
 * Strategies
 *  - App shell (HTML/CSS/JS/icons/manifest/offline page):  precached on
 *    install, served stale-while-revalidate so updates land fast offline-first.
 *  - Navigations: network-first; on failure serve the cached app shell for
 *    in-scope URLs, or the dedicated offline fallback page for anything else.
 *  - /api/* (cloud sync): network-only, never cached or intercepted.
 *  - Pinned CDN libs (Chart.js): cache-first, immutable by version pin.
 *  - Other cross-origin: stale-while-revalidate.
 * Cache versioning: bump CACHE_VERSION on every deploy to invalidate cleanly.
 * ========================================================================== */

const CACHE_VERSION = 'tinkl-v6';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = '/offline.html';

// Pinned third-party libs are immutable by version — cache-first is safe.
const CHART_JS_URL =
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';

// Every file the app needs to boot with zero network. Paths are root-relative
// and MUST exist at deploy time; each is cached independently so one 404 can
// never abort the whole install (cache.addAll fails atomically).
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/vetpass.html',
  '/manifest.json',
  '/css/main.css',
  '/css/tokens.css',
  '/css/base.css',
  '/css/components.css',
  '/css/views.css',
  '/css/print.css',
  '/js/app.js',
  '/js/modules/adherence.js',
  '/js/modules/alarms.js',
  '/js/modules/birthdays.js',
  '/js/modules/breedData.js',
  '/js/modules/camera.js',
  '/js/modules/db.js',
  '/js/modules/exportImport.js',
  '/js/modules/healthRadar.js',
  '/js/modules/icons.js',
  '/js/modules/insights.js',
  '/js/modules/logTypes.js',
  '/js/modules/modal.js',
  '/js/modules/navigation.js',
  '/js/modules/push.js',
  '/js/modules/reminders.js',
  '/js/modules/settings.js',
  '/js/modules/state.js',
  '/js/modules/sync.js',
  '/js/modules/utils.js',
  '/js/modules/vaccineSchedule.js',
  '/js/modules/vetShare.js',
  '/js/modules/views/careLog.js',
  '/js/modules/views/dashboard.js',
  '/js/modules/views/health.js',
  '/js/modules/views/history.js',
  '/js/modules/views/household.js',
  '/js/modules/views/pets.js',
  '/js/modules/views/quickLog.js',
  '/js/modules/views/stats.js',
  '/js/vendor/lz-string.min.js',
  '/js/vendor/qrcode-generator.js',
  '/assets/icons/favicon.ico',
  '/assets/icons/tinkl-logo-paw3-192.png',
  '/assets/icons/tinkl-logo-paw3.png',
  '/assets/icons/icon-maskable-192.png',
  '/assets/icons/icon-maskable-512.png',
  CHART_JS_URL,
];

/* ------------------------------- install -------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.all(
          APP_SHELL.map((url) =>
            cache.add(url).catch((err) => {
              // Non-fatal: log and continue so a single missing asset
              // never prevents activation (and kills offline support).
              console.warn('[TINKL SW] precache miss:', url, err);
            }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

/* ------------------------------- activate ------------------------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith('tinkl-') &&
              key !== STATIC_CACHE &&
              key !== RUNTIME_CACHE,
          )
          .map((key) => caches.delete(key)),
      );
      // Proactively cache the offline page in the static bucket in case
      // precache skipped it (e.g. first install raced a deploy).
      const staticCache = await caches.open(STATIC_CACHE);
      const offline = await staticCache.match(OFFLINE_URL);
      if (!offline) {
        await fetch(OFFLINE_URL)
          .then((res) => {
            if (res && res.ok) staticCache.put(OFFLINE_URL, res);
          })
          .catch(() => {});
      }
      await self.clients.claim();
    })(),
  );
});

/* --------------------------------- fetch --------------------------------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  // Cache API only supports http(s). Extension-injected schemes
  // (chrome-extension:// etc.) must pass through untouched.
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);

  // Cloud sync API: network-only. Never cache backup/restore traffic or
  // "offline-first" caching will serve stale snapshots and corrupt merges.
  if (url.pathname.startsWith('/api/')) return;

  // --- Navigations: network-first -------------------------------------------
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);
          // Refresh the cached shell copy in the background (fire-and-forget).
          const copy = network.clone();
          caches
            .open(STATIC_CACHE)
            .then((cache) => cache.put('/index.html', copy))
            .catch(() => {});
          return network;
        } catch (err) {
          // Offline: (1) exact cached page first — this makes precached
          // standalone pages like /vetpass.html?d=... work offline, since
          // their data travels in the URL; (2) the app shell so the SPA
          // boots from IndexedDB; (3) the dedicated offline page.
          const exact = await caches.match(request);
          if (exact) return exact;
          const shell = await caches.match('/index.html');
          if (shell) return shell;
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return Response.error();
        }
      })(),
    );
    return;
  }

  // --- Pinned immutable CDN lib: cache-first --------------------------------
  if (request.url === CHART_JS_URL) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const network = await fetch(request);
        // Only lock in successful responses — never cache a failed/opaque
        // error page as if it were the library.
        if (network && network.ok) {
          const copy = network.clone();
          caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, copy))
            .catch(() => {});
        }
        return network;
      })(),
    );
    return;
  }

  // --- Same-origin static assets: stale-while-revalidate --------------------
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((network) => {
            if (network && network.ok) cache.put(request, network.clone());
            return network;
          })
          .catch(() => cached); // offline -> fall back to stale copy
        return cached || networkPromise;
      })(),
    );
    return;
  }

  // --- Other cross-origin (fonts etc.): stale-while-revalidate --------------
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkPromise = fetch(request)
        .then((network) => {
          if (network && network.ok) cache.put(request, network.clone());
          return network;
        })
        .catch(() => cached);
      return cached || networkPromise;
    })(),
  );
});

/* ------------------------- background sync -------------------------------- */
// The app registers a 'tinkl-backup' sync tag when cloud sync is enabled and
// a backup is queued while offline. When connectivity returns, nudge every
// open client to flush its queue; clients own the actual upload logic.
self.addEventListener('sync', (event) => {
  if (event.tag === 'tinkl-backup') {
    event.waitUntil(
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          clients.forEach((client) =>
            client.postMessage({ type: 'tinkl-flush-backup' }),
          );
        }),
    );
  }
});

/* --------------------- notification tap -> app routing -------------------- */
// Single handler, two branches:
//  1. Local alarm notifications (no data.url): post a { type: 'notif-action',
//     tag } message — the app listens on the serviceWorker 'message' event to
//     open the matching alarm dialog.
//  2. Push notifications carrying data.url: deep-link to that URL.
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const tag = notification.tag;
  const target = notification && notification.data && notification.data.url;
  notification.close();

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const existing = clients.find((c) => 'focus' in c);

      if (target) {
        // Push deep-link branch.
        if (existing) {
          existing.postMessage({ type: 'tinkl-open-url', url: target });
          return existing.focus();
        }
        return self.clients.openWindow(target);
      }

      // Local alarm branch.
      const payload = { type: 'notif-action', tag };
      if (existing) {
        existing.postMessage(payload);
        return existing.focus();
      }
      const client = await self.clients.openWindow('/?source=notification');
      if (client) {
        // Give the page a moment to attach its message listener.
        setTimeout(() => client.postMessage(payload), 1000);
      }
    })(),
  );
});
/* ------------------------- push (future use) ------------------------------ */
// Server-driven reminders (e.g. from the Java backend or Worker cron) arrive
// here. Payload shape: { title, body, tag, url }. Kept fully functional:
// no push subscription exists yet, but any future one works with zero SW
// changes.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'TINKL';
  const options = {
    body: data.body || '',
    tag: data.tag || 'tinkl-push',
    icon: '/assets/icons/tinkl-logo-paw3-192.png',
    badge: '/assets/icons/tinkl-logo-paw3-192.png',
    data: { url: data.url || '/?source=push' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
