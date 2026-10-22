# TINKL. — Production & Lighthouse PWA Checklist

Run through top to bottom before every production deploy. Every box must be
checked; anything unchecked is a launch blocker.

## 1. Installability (Lighthouse "PWA Optimized" / "Installable")

- [ ] Served over **HTTPS** (localhost exempt for dev only).
- [ ] `manifest.json` linked from every HTML entry:
      `<link rel="manifest" href="/manifest.json">`.
- [ ] Manifest has `name` (or `short_name`), `start_url`, `display:
      standalone|fullscreen|minimal-ui`.
- [ ] Manifest has **192px AND 512px icons**, `purpose: "any"`.
- [ ] Manifest has **maskable 192px + 512px** icons (`purpose: "maskable"`,
      artwork inside the 80%-diameter safe zone) —
      `assets/icons/icon-maskable-*.png` in this repo.
- [ ] `theme_color` set in manifest AND
      `<meta name="theme-color" content="#0b0d16">` in HTML.
- [ ] `background_color` set (splash screen).
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- [ ] `apple-touch-icon` 180px linked for iOS Add-to-Home-Screen.
- [ ] `start_url` (`/?source=pwa`) actually loads while **offline**
      (covered by the SW navigation fallback).
- [ ] Shortcuts (`?quick=pee`, `?quick=poop`, `?view=insights`) each open the
      app to the right action — test on Android.

## 2. Service worker correctness

- [ ] SW registered from the **scope root** (`/sw.js`, scope `/`).
- [ ] `Cache-Control: no-cache` (or `max-age=0`) on **sw.js** — verified with:
      `curl -sI https://YOURDOMAIN/sw.js | grep -i cache-control`
      Expected: `no-cache`. Anything with `max-age>0` = launch blocker.
- [ ] `CACHE_VERSION` bumped in `sw.js` for this deploy.
- [ ] Old caches deleted on `activate` (keep 2 most recent during rollout).
- [ ] Every URL in `APP_SHELL` returns **200** — run:
      `while read -r u; do curl -so /dev/null -w "%{http_code} $u\n" \
        "https://YOURDOMAIN$u"; done < <(node -e "console.log(APP_SHELL.join('\n'))")`
- [ ] `/api/*` requests are **never** served from cache (network-only).
- [ ] Update flow tested: deploy vN+1 → reload → new SW installs →
      `skipWaiting` + `clients.claim` activate it without a stuck "waiting"
      worker (check `chrome://serviceworker-internals` / DevTools →
      Application → Service Workers).

## 3. Offline resilience

- [ ] Airplane mode: cold load `/` renders the app shell from cache.
- [ ] Airplane mode: `/offline.html` renders standalone (no external deps —
      all CSS/JS inline) with working "Try Again".
- [ ] All core user journeys work offline: log pee/poop, add med, view
      insights from IndexedDB, export CSV/JSON.
- [ ] Cloud backup queued while offline fires via Background Sync
      (`tinkl-backup` tag) when connectivity returns.

## 4. Performance budget (Lighthouse)

- [ ] `dist/` built with `build/build.sh`: CSS/JS/HTML minified.
- [ ] Text assets served **Brotli** (`content-encoding: br`) where supported,
      gzip fallback — verify: `curl -sIH "Accept-Encoding: br" \
      https://YOURDOMAIN/js/app.js | grep -i content-encoding`.
- [ ] Total app-shell transfer (HTML+CSS+JS, compressed) **< 300 KB**
      excluding Chart.js (cached separately, pinned version).
- [ ] Images: hero/logo served as PNG now; convert photographic assets to
      **AVIF/WebP** with PNG fallback when adding new imagery.
- [ ] Lighthouse PWA category: **100**. Performance: target **95+ mobile**.
- [ ] No render-blocking: CSS in `<head>`, JS as `type="module"` (deferred by
      default), Chart.js with `defer`.
- [ ] Fonts: system stack only (no webfont downloads) — confirmed.

## 5. Cloudflare backend (Workers + Pages — primary)

- [ ] `backend/cloudflare/_headers` copied to the Pages deploy root (`dist/`).
- [ ] MIME check: `curl -sI https://YOURDOMAIN/manifest.json` →
      `content-type: application/manifest+json`;
      `sw.js` → `application/javascript` (Pages sets this natively).
- [ ] Cache headers verified per file class (from `_headers`):
      `no-cache` on `/sw.js`, `no-store` on HTML, 1h on manifest,
      1y immutable on `/assets/*` — `curl -sI` each.
- [ ] `Service-Worker-Allowed: /` present on `/sw.js`.
- [ ] Worker deployed: `npx wrangler deploy` from `backend/cloudflare/`;
      `/health` returns `{ status: "ok", push: true }`.
- [ ] Secrets set: `API_SECRET`, `VAPID_JWK`, `VAPID_PUBLIC_KEY`,
      `VAPID_SUBJECT` (via `wrangler secret put` — never in the repo).
- [ ] `/api/*` never cached by the SW (network-only) — verify a backup
      round-trip while "offline-first" caching is active.
- [ ] Push end-to-end: subscribe in Settings → `POST /api/push/send` →
      notification arrives with the app closed → tap deep-links correctly.
- [ ] If a Java backend is ever required instead, the fallback snippets live
      in `backend/java-spring-alternative/` (standing rule: Workers first).

## 6. Release hygiene

- [ ] `CHANGELOG` entry + git tag for the release.
- [ ] Smoke test on real Android (Chrome) + iOS (Safari Add to Home Screen):
      install prompt, splash, standalone launch, notification permission.
- [ ] Rollback plan: previous `dist/` archived; reverting = redeploy old
      `dist/` + bump `CACHE_VERSION` again so clients pick it up.
