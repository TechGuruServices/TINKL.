// worker/worker.js — TINKL. Cloudflare Worker entrypoint
//
// Two jobs:
//   1. /api/backup/* → Durable Object (cross-device backup/restore/delete)
//   2. /api/push/*    → Web Push subscribe + fan-out (server-driven reminders
//                       that fire even when the PWA is closed)
//
// Static PWA shell is served by Cloudflare Pages (see ../_headers for the
// production cache-header policy). This Worker is API-only.
//
// Auth model (per-device credential — no accounts, no shared secret):
//   - The PWA generates a random 256-bit sync credential ON the device
//     (see js/modules/sync.js) and sends it as `Authorization: Bearer <hex>`.
//   - Backup and push-subscribe requests are routed to a Durable Object
//     whose name is `user:` + SHA-256(credential). The raw credential is
//     never stored server-side and never appears in any object name, so
//     one user's credential can only ever reach that user's own backup.
//   - Push subscriptions live in a separate registry object (they contain
//     no pet data — just a push endpoint and its encryption keys).
//   - POST /api/push/send is an operator action and requires ADMIN_TOKEN.
//   - The legacy shared API_SECRET is NO LONGER accepted anywhere. After
//     deploying this Worker, delete that secret:
//       npx wrangler secret delete API_SECRET
//
// Secrets (never in wrangler.toml — set via `npx wrangler secret put <NAME>`):
//   ADMIN_TOKEN       operator token, guards /api/push/send only
//   VAPID_JWK         full JWK JSON incl. `d`  (from gen-vapid.mjs)
//   VAPID_PUBLIC_KEY  base64url public key     (from gen-vapid.mjs)
//   VAPID_SUBJECT     e.g. mailto:you@yourdomain

export { TinklBackup } from './durable-object.js';
import { sendPush } from './webpush.js';

const ALLOWED_ORIGINS = new Set([
  'https://tinkl.pages.dev',
  'https://tinkl.techguruofficial.us',
]);

function corsHeaders(request) {
  const origin = request?.headers?.get('Origin') || '';
  const allowed =
    ALLOWED_ORIGINS.has(origin) ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://tinkl.pages.dev',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (request, data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request), ...extra },
  });

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function bearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  return header.replace(/^Bearer\s+/i, '');
}

/** A sync credential is 32 random bytes rendered as 64 lowercase hex chars. */
function isValidCredential(token) {
  return typeof token === 'string' && /^[0-9a-f]{64}$/.test(token);
}

/** Derive the per-user Durable Object name from a sync credential. */
async function objectNameForCredential(credential) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(credential),
  );
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `user:${hex}`;
}

/** Forward a request to a named Durable Object. */
async function toDO(request, env, path, objectName) {
  const id = env.TINKL_BACKUP.idFromName(objectName);
  const backup = env.TINKL_BACKUP.get(id);
  const doUrl = new URL(request.url);
  doUrl.pathname = path;
  const res = await backup.fetch(new Request(doUrl.toString(), request));
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

const PUSH_REGISTRY_OBJECT = 'push-registry';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    /* ------------------------- backup routes ------------------------- */
    // Per-device credential required; the request is forwarded to the
    // caller's OWN Durable Object with the /backup/... path intact.
    if (url.pathname.startsWith('/api/backup/')) {
      const credential = bearerToken(request);
      if (!isValidCredential(credential)) {
        return json(request, { error: 'Unauthorized' }, 401);
      }
      const objectName = await objectNameForCredential(credential);
      return toDO(request, env, url.pathname.replace('/api', ''), objectName);
    }

    /* -------------------------- push routes -------------------------- */

    // Public key for the client — public by design, no auth needed.
    if (url.pathname === '/api/push/vapid-public-key' && request.method === 'GET') {
      if (!env.VAPID_PUBLIC_KEY) {
        return json(request, { error: 'push not configured' }, 503);
      }
      return json(request, { key: env.VAPID_PUBLIC_KEY });
    }

    // Subscriptions belong to the caller's credential, but are stored in
    // the push registry object (endpoints + keys only, no pet data) so the
    // operator fan-out can reach every subscriber.
    if (url.pathname === '/api/push/subscribe') {
      const credential = bearerToken(request);
      if (!isValidCredential(credential)) {
        return json(request, { error: 'Unauthorized' }, 401);
      }
      return toDO(request, env, '/push/subscribe', PUSH_REGISTRY_OBJECT);
    }

    // POST /api/push/send — OPERATOR ONLY (ADMIN_TOKEN, never shipped to
    // any client). Body: { title, body?, tag?, url? }
    // Fans out to every stored subscription; prunes dead (410/404) ones.
    if (url.pathname === '/api/push/send' && request.method === 'POST') {
      if (!env.ADMIN_TOKEN || !timingSafeEqual(bearerToken(request), env.ADMIN_TOKEN)) {
        return json(request, { error: 'Unauthorized' }, 401);
      }
      if (!env.VAPID_JWK || !env.VAPID_SUBJECT) {
        return json(request, { error: 'push not configured' }, 503);
      }
      let msg;
      try {
        msg = await request.json();
      } catch {
        return json(request, { error: 'invalid JSON body' }, 400);
      }
      if (!msg.title) return json(request, { error: 'title is required' }, 400);

      const payload = {
        title: String(msg.title).slice(0, 120),
        body: String(msg.body || '').slice(0, 240),
        tag: String(msg.tag || 'tinkl-push'),
        url: String(msg.url || '/?source=push'),
      };

      let vapidJwk;
      try {
        vapidJwk = JSON.parse(env.VAPID_JWK);
      } catch {
        return json(request, { error: 'VAPID_JWK secret is not valid JSON' }, 500);
      }
      const vapid = { jwk: vapidJwk, subject: env.VAPID_SUBJECT };

      const subsRes = await toDO(
        new Request('https://do/push/subs', { method: 'GET' }),
        env,
        '/push/subs',
        PUSH_REGISTRY_OBJECT,
      );
      const { subs = [] } = await subsRes.json();

      let sent = 0;
      const dead = [];
      const errors = [];
      await Promise.all(
        subs.map(async (sub) => {
          try {
            const r = await sendPush(sub, payload, vapid);
            if (r.ok) sent++;
            else if (r.gone) dead.push(sub.endpoint);
            else errors.push({ endpoint: sub.endpoint, status: r.status });
          } catch (err) {
            errors.push({ endpoint: sub.endpoint, error: err.message });
          }
        }),
      );

      if (dead.length) {
        await toDO(
          new Request('https://do/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoints: dead }),
          }),
          env,
          '/push/subscribe',
          PUSH_REGISTRY_OBJECT,
        );
      }
      return json(request, { ok: true, sent, pruned: dead.length, errors });
    }

    /* ---------------------------- misc ------------------------------- */
    if (url.pathname === '/health' && request.method === 'GET') {
      return json(request, {
        status: 'ok',
        ts: Date.now(),
        push: !!env.VAPID_JWK,
      });
    }

    return new Response('TINKL API worker is running', {
      status: 200,
      headers: { 'Content-Type': 'text/plain', ...corsHeaders(request) },
    });
  },
};
