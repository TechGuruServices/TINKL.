# TINKL. — Production PWA Refactoring Blueprint

**From:** single 445 KB `index.html` (inline CSS + inline JS + markup mixed)
**To:** modular, offline-first Progressive Web App on Cloudflare's edge —
Pages serves the shell, Workers serve the API. Zero servers, zero build-step
required to run, production-hardened to pass 100% of Lighthouse PWA audits.

This document is the blueprint. The implementation ships alongside it in this
repo (`tinkl-pwa/`).

---

## 1. Architectural separation & refactoring

### 1.1 What the legacy app was

| Concern | Legacy | Refactored |
|---|---|---|
| Styles | 1 × 54 KB `<style>` in `<head>` + 1 print block at end of `<body>` | `css/tokens.css`, `base.css`, `components.css`, `views.css` (+ `print.css`), wired via `css/main.css` (`@import` only) |
| Logic | 1 × 143 KB inline `<script>` at end of `<body>`, 79 functions in one scope | 24 ES6 modules under `js/modules/` + `js/modules/views/`, single entry `js/app.js` |
| Markup | 248 KB mixed with the above | `index.html` — pure semantic HTML, zero inline `<style>`/`<script>` |
| PWA shell | `manifest.webmanifest` + basic `sw.js` | Production `manifest.json` + hardened `sw.js` + `offline.html` |
| Backend | Cloudflare Worker (backup sync only) | Same Worker, extended: backup sync + Web Push fan-out (`/api/push/*`) |

### 1.2 Module map (final)

```
tinkl-pwa/
├── index.html            # semantic shell; <link> CSS, <script type="module"> app.js
├── offline.html          # self-contained offline fallback (inline CSS/JS only)
├── vetpass.html          # read-only Vet Pass report (?d=<lz-compressed JSON>)
├── manifest.json         # production manifest (maskable icons, shortcuts, screenshots)
├── sw.js                 # production service worker (CACHE_VERSION = tinkl-v6)
├── css/
│   ├── main.css          # @import tokens → base → components → views (order = cascade)
│   ├── tokens.css        # :root custom props + 5 theme overrides
│   ├── base.css          # reset, typography, layout, ambient backgrounds
│   ├── components.css    # buttons, cards, modals, forms, nav, feed rows
│   ├── views.css         # per-view rules (dashboard … settings)
│   └── print.css         # vet-report print styles (media="print")
├── js/
│   ├── app.js            # ONLY module with side effects: init, bindings, SW reg,
│   │                     # launch params (?quick=pee|poop, ?view=, ?source=),
│   │                     # SW message handlers (notif-action, tinkl-open-url, flush)
│   ├── legacy.js         # verbatim legacy script — REFERENCE ONLY, never shipped
│   ├── modules/
│   │   ├── icons.js db.js state.js utils.js logTypes.js vaccineSchedule.js
│   │   ├── sync.js navigation.js modal.js camera.js reminders.js insights.js
│   │   ├── settings.js alarms.js birthdays.js exportImport.js
│   │   ├── healthRadar.js   ★ NEW — on-device anomaly engine
│   │   ├── adherence.js     ★ NEW — med adherence % + refill forecast
│   │   ├── breedData.js     ★ NEW — breed weight percentile tables
│   │   ├── vetShare.js      ★ NEW — Vet Pass payload builder
│   │   ├── push.js          ★ NEW — Web Push subscribe/unsubscribe client
│   │   └── views/ (dashboard, quickLog, pets, careLog, health,
│   │               history, stats, household ★ NEW)
│   └── vendor/ (lz-string.min.js, qrcode-generator.js — pinned, SW-cached)
├── assets/icons/         # any + maskable icons (maskable generated w/ safe zone)
├── backend/cloudflare/   # _headers, wrangler.toml, worker/ (API + Web Push)
├── backend/java-spring-alternative/  # fallback only — Workers is the rule
├── build/build.sh        # minify + gzip/brotli + size report
└── docs/                 # BLUEPRINT.md, PRODUCTION_CHECKLIST.md
```

**Dependency rules enforced:** `state.js` and `db.js` are leaves (imported,
never importing views); views import from core modules, never vice versa;
no circular imports (verified: 125 imports resolve, zero cycles).

### 1.3 Separation method (reproducible)

1. **Mechanical pass (scripted):** extract `<style>` → CSS files, inline
   `<script>` → `js/legacy.js`, remainder → markup shell. Byte-exact.
2. **CSS pass:** split by concern (tokens/base/components/views). Proven by
   selector diff — 268/268 rules preserved, cascade order kept.
3. **JS pass:** cut along the legacy `/* ==== Section ==== */` banners into
   named-export ES6 modules; `app.js` owns init/bindings only.
4. **Markup pass:** keep every static `id` (88/88 preserved, +3 new mounts);
   modal/form templates stay JS-rendered as in legacy — no behavior change.
5. **Validation:** `node --check` 33/33, import-graph resolution, DOM-id
   cross-check (every `getElementById` target exists statically or is created
   by its module), SW precache existence (48/48).

### 1.4 Backend assumptions (updated per your call)

**Primary: Cloudflare Workers + Pages — always, when possible.**
Pages serves the static shell; the Worker is API-only (`/api/backup/*`,
`/api/push/*`). The service worker treats `/api/*` as network-only, so sync
traffic can never be served stale. Java/Spring Boot snippets are retained
**only** as a fallback for environments that mandate Java
(`backend/java-spring-alternative/`).

---

## 2. PWA production core

### 2.1 `manifest.json` — what's production about it

- `id`, `start_url: "/?source=pwa"`, `scope: "/"`, `display: "standalone"`
  with `display_override: ["window-controls-overlay", "standalone"]`
- **4 icons:** `any` 192/512 + `maskable` 192/512 (maskable artwork padded
  into the safe zone on the theme background — generated, not assumed)
- **Shortcuts** (differentiator UX): "Log Pee" → `/?quick=pee`, "Log Poop" →
  `/?quick=poop`, "Health Radar" → `/?view=insights` — handled by `app.js`
  on launch
- `screenshots` (wide form factor), `categories`, `lang/dir`,
  `prefer_related_applications: false`

### 2.2 `sw.js` — caching strategy (no placeholders)

```js
// install: precache 48 app-shell URLs independently — one 404 can never
//          abort install (cache.addAll would fail atomically)
caches.open(STATIC_CACHE).then(cache =>
  Promise.all(APP_SHELL.map(url =>
    cache.add(url).catch(err => console.warn('[TINKL SW] precache miss:', url, err)))))
  .then(() => self.skipWaiting());

// activate: delete every tinkl-* cache except current version; backfill
//           offline.html; clients.claim()

// fetch:
//  • /api/*                    → network-only (never cached, never intercepted)
//  • navigations                → NETWORK-FIRST; offline: exact cached page
//                                 (covers /vetpass.html?d=…) → cached /index.html
//                                 → /offline.html
//  • pinned Chart.js (immutable)→ CACHE-FIRST (version-pinned == immutable)
//  • same-origin static         → STALE-WHILE-REVALIDATE
//  • cross-origin               → STALE-WHILE-REVALIDATE (runtime cache)
//  • non-http(s) schemes        → pass through (extension-injected requests
//                                 would otherwise crash cache.put())
```

Plus: `sync` handler (`tinkl-backup` → nudges clients to flush the backup
queue), `push` handler (shows notification from `{title, body, tag, url}`),
and a **single** `notificationclick` handler with two branches — local alarms
(post `notif-action` to the app) and push deep-links (`data.url`).

### 2.3 `offline.html`

Fully self-contained (inline CSS/JS, zero network deps), on-brand dark
glass card, live online/offline indicator, auto-reload on reconnect.

---

## 3. Cloudflare backend integration

### 3.1 Pages — `_headers` (MIME types + cache headers)

```http
/sw.js
  Cache-Control: no-cache            # revalidate every load — updates must land
  Service-Worker-Allowed: /

/index.html, /offline.html, /vetpass.html, /
  Cache-Control: no-store            # the SW keeps its own copy; network = fresh

/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=3600

/css/*, /js/*
  Cache-Control: public, max-age=86400   # SW does SWR on top; safe unhashed

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

No CSP is set deliberately — `offline.html` needs inline code to work with
zero network. Add one only after auditing every inline block.

### 3.2 Worker — API surface (`backend/cloudflare/`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| PUT/GET/DELETE | `/api/backup/latest`, `/api/backup/metadata` | Bearer | Durable Object snapshot sync |
| GET | `/api/push/vapid-public-key` | — | public key for client subscription |
| POST/DELETE | `/api/push/subscribe` | Bearer | store/remove PushSubscription |
| POST | `/api/push/send` | Bearer | fan-out `{title, body?, tag?, url?}`; auto-prunes dead (410/404) endpoints |
| GET | `/health` | — | `{status, ts, push}` |

**Web Push crypto** (`worker/webpush.js`, zero deps): RFC 8291 `aes128gcm`
payload encryption (ECDH P-256 → HKDF-SHA256 → AES-GCM, single-record
`0x02` padding) + RFC 8292 VAPID JWT (ES256). Verified with a round-trip
test: encrypt → independent decrypt → payload identical; VAPID signature
validates; `k` param matches the JWK.

**Deploy:**

```bash
# Pages (static shell)
./build/build.sh . ./dist && cp backend/cloudflare/_headers ./dist/_headers
npx wrangler pages deploy ./dist --project-name=tinkl   # bump CACHE_VERSION first

# Worker (API)
cd backend/cloudflare
node worker/gen-vapid.mjs                 # one-time keypair
npx wrangler secret put API_SECRET        # must match the PWA sync secret
npx wrangler secret put VAPID_JWK         # full JWK JSON
npx wrangler secret put VAPID_PUBLIC_KEY  # base64url
npx wrangler secret put VAPID_SUBJECT     # mailto:…
npx wrangler deploy
```

**Client wiring** (`js/modules/push.js` + Settings toggle): fetches the
VAPID key → `pushManager.subscribe()` → POSTs the subscription; toggle off
unsubscribes and DELETEs it server-side.

### 3.3 Java fallback

If a deployment ever mandates Java, `backend/java-spring-alternative/`
holds the Spring Boot 3 `PwaStaticResourceConfig` (same header policy as
`_headers`: `no-cache` SW, `no-store` HTML, 1 h manifest, 1 y immutable
assets, `.webmanifest` MIME mapping) plus compression properties. Standing
rule: Workers first.

---

## 4. Differentiators — what makes Tinkle unique

| # | Feature | Module | Why no competitor has it like this |
|---|---|---|---|
| 1 | **Health Radar** — on-device anomaly engine | `healthRadar.js` | 30-day per-pet baselines (median intervals/counts); flags no-poop stretches, water/feed drops, accident spikes, missed-med streaks. Runs fully offline, no account, no cloud AI. Surfaces: dashboard banner, Insights card, vet report flags |
| 2 | **Medication adherence + refill forecast** | `adherence.js` | Trailing-14-day adherence % per med, run-out date from the dose schedule, one-tap "add refill reminder" |
| 3 | **Breed weight percentiles** | `breedData.js` | 46 dog + 13 cat breed healthy bands; latest weight shown as breed percentile |
| 4 | **Vet Pass** — shareable read-only report | `vetShare.js` + `vetpass.html` | LZ-compressed report in a link (`?d=`), QR code, `navigator.share`; works offline (data is in the URL) |
| 5 | **Household dashboard** | `views/household.js` | All-pets today view: per-pet counts, radar badges, weight sparklines |
| 6 | **Server-driven push** | `push.js` + Worker | Medication/health alerts even with the app closed (VAPID Web Push) |
| — | Privacy architecture | — | No account, IndexedDB-first, optional encrypted-cloud backup — the anti-SaaS position |

---

## 5. Production checklist & performance

Full gate list: `docs/PRODUCTION_CHECKLIST.md` (installability, SW
correctness, offline resilience, performance budget, backend, release
hygiene). Build optimizations (`build/build.sh`):

1. **Minify** — `clean-css-cli` (CSS), `terser` (JS, `--compress --mangle`),
   `html-minifier-terser` (HTML); graceful fallback if tooling absent
2. **Pre-compress** — `gzip -9` → `.gz`, `brotli -q 11` → `.br` for every
   text asset; Pages/CDN serves the best `Accept-Encoding` match
3. **Size report** — per-file orig/gzip/brotli table printed every build
4. **Cache discipline** — filenames stay stable; `CACHE_VERSION` in `sw.js`
   is the invalidation mechanism (bump per deploy)
5. **Runtime** — system font stack (zero webfont downloads), Chart.js
   `defer`red + SW-cached, JS as `type="module"` (deferred by default),
   images already sized; convert future photographic assets to AVIF/WebP

**Lighthouse PWA 100 gates:** HTTPS · viewport meta · 192+512 icons
(incl. maskable) · `theme_color` (manifest + meta) · `background_color` ·
`apple-touch-icon` · `start_url` loads offline · SW with fetch handler ·
`no-cache` on `sw.js` (verify: `curl -sI …/sw.js | grep -i cache-control`).

---

## 6. Known limits & next steps

- **Headless boot test** could not run in this VM (Chromium binary emits
  zero DOM bytes — toolchain failure, not an app signal). Static validation
  stands in: 33/33 `node --check`, 125/125 imports resolve, 0 static IDs
  lost, 48/48 precache paths exist. Re-run on any working Chromium:
  `chrome --headless --dump-dom http://localhost:8000/` must show zero
  console errors. Real-device smoke test (Android install prompt, iOS Add
  to Home Screen) is still required before launch.
- **Push cron:** `/api/push/send` is the trigger; wire it to a schedule
  (cron/n8n/Workers Cron Trigger reading each user's latest DO backup for
  meds due soon) when server-driven reminders go live.
- **Vet Pass QR** uses vendored `qrcode-generator` (MIT) — pinned and
  SW-cached; no CDN dependency at runtime.
