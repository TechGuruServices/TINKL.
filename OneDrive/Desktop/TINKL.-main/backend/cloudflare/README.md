# TINKL. — Cloudflare backend (Workers + Pages)

This is the **primary, preferred backend** for the Tinkle PWA: zero servers,
global edge, free tier friendly.

| Piece | Where | What it does |
|---|---|---|
| PWA shell | Cloudflare Pages (`tinkl-pwa/`) | `index.html`, `sw.js`, `manifest.json`, `css/`, `js/`, `assets/` |
| Cache policy | `_headers` (this dir → copy to Pages project root) | `no-cache` SW, `no-store` HTML, immutable icons |
| Sync + Push API | Worker (`tinkl-sync`, this dir) | `/api/backup/*` → Durable Object, `/api/push/*` → Web Push |

## Deploy the PWA shell (Pages)

```bash
cd tinkl-pwa
./build/build.sh . ./dist          # minify + gzip/brotli
cp backend/cloudflare/_headers ./dist/_headers
npx wrangler pages deploy ./dist --project-name=tinkl
```

Bump `CACHE_VERSION` in `sw.js` before every deploy.

## Deploy the API worker

```bash
cd tinkl-pwa/backend/cloudflare

# 1. One-time secrets (values never touch source control)
node worker/gen-vapid.mjs
# → paste each output line:
npx wrangler secret put ADMIN_TOKEN       # operator token for /api/push/send
npx wrangler secret put VAPID_JWK         # full JWK JSON line
npx wrangler secret put VAPID_PUBLIC_KEY  # base64url line
npx wrangler secret put VAPID_SUBJECT     # e.g. mailto:you@yourdomain

# 2. Deploy
npx wrangler deploy
```

## API reference

All `/api/*` routes are served by the worker; the service worker never
caches them (network-only), so backup/restore can never read stale data.

Auth: backup and push-subscribe routes take the PWA's per-device sync
credential (`Authorization: Bearer <64-hex>`, generated on the device);
the Worker scopes each backup to a Durable Object named from a SHA-256
hash of that credential. `/api/push/send` is operator-only and requires
`ADMIN_TOKEN`. There is no shared client secret.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| PUT | `/api/backup/latest` | Bearer | Push full IndexedDB snapshot |
| GET | `/api/backup/latest` | Bearer | Pull latest snapshot |
| GET | `/api/backup/metadata` | Bearer | Last-sync info |
| DELETE | `/api/backup/latest` | Bearer | Wipe cloud data |
| GET | `/api/push/vapid-public-key` | — | VAPID public key (client subscribes with this) |
| POST | `/api/push/subscribe` | Bearer | Store a PushSubscription |
| DELETE | `/api/push/subscribe` | Bearer | Remove subscription(s) |
| POST | `/api/push/send` | Bearer | Fan-out `{title, body?, tag?, url?}` to all subscribers; prunes dead (410/404) endpoints automatically |
| GET | `/health` | — | `{ status, ts, push }` |

Test a push end-to-end after subscribing in the app's Settings:

```bash
curl -X POST https://tinkl-sync.<sub>.workers.dev/api/push/send \
  -H "Authorization: Bearer $API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"title":"TINKL","body":"Medication due in 30 minutes","tag":"med-due","url":"/?view=health"}'
```

The service worker's `push` handler shows the notification; tapping it
deep-links to `url` via the `notificationclick` handler.

## Wiring server-driven reminders

`POST /api/push/send` is the single trigger. Drive it from whatever owns the
schedule:

- **Manual / n8n / cron on your machine** — the curl above on a schedule.
- **Cloudflare Cron Trigger** — add to `wrangler.toml`:
  ```toml
  [triggers]
  crons = ["30 7 * * *"]   # daily 07:30 UTC check-in nudge
  ```
  and implement `scheduled()` in `worker.js` to call the same fan-out path
  (e.g. read each user's latest backup from the DO, compute meds due soon
  with the same schedule logic as the PWA, and push per-device).
- **Your own backend** — any HTTPS client with the Bearer secret.
