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
// Secrets (never in wrangler.toml — set via `npx wrangler secret put <NAME>`):
//   API_SECRET        shared secret, must match the PWA's sync config
//   VAPID_JWK         full JWK JSON incl. `d`  (from gen-vapid.mjs)
//   VAPID_PUBLIC_KEY  base64url public key     (from gen-vapid.mjs)
//   VAPID_SUBJECT     e.g. mailto:you@yourdomain

export { TinklBackup } from './durable-object.js';
import { sendPush } from './webpush.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extra },
  });

function authed(request, env) {
  const header = request.headers.get('Authorization') || '';
  const provided = header.replace(/^Bearer\s+/i, '');
  return !!env.API_SECRET && provided === env.API_SECRET;
}

/** Forward a request to the user's Durable Object (prefix already stripped). */
async function toDO(request, env, path) {
  const id = env.TINKL_BACKUP.idFromName('default');
  const backup = env.TINKL_BACKUP.get(id);
  const doUrl = new URL(request.url);
  doUrl.pathname = path;
  const res = await backup.fetch(new Request(doUrl.toString(), request));
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    /* ------------------------- backup routes ------------------------- */
    if (url.pathname.startsWith('/api/backup/')) {
      if (!authed(request, env)) return json({ error: 'Unauthorized' }, 401);
      return toDO(
        request,
        env,
        url.pathname.replace('/api/backup', '') || '/',
      );
    }

    /* -------------------------- push routes -------------------------- */

    // Public key for the client — public by design, no auth needed.
    if (url.pathname === '/api/push/vapid-public-key' && request.method === 'GET') {
      if (!env.VAPID_PUBLIC_KEY) {
        return json({ error: 'push not configured' }, 503);
      }
      return json({ key: env.VAPID_PUBLIC_KEY });
    }

    if (url.pathname === '/api/push/subscribe') {
      if (!authed(request, env)) return json({ error: 'Unauthorized' }, 401);
      return toDO(request, env, '/push/subscribe');
    }

    // POST /api/push/send — body: { title, body?, tag?, url? }
    // Fans out to every stored subscription; prunes dead (410/404) ones.
    if (url.pathname === '/api/push/send' && request.method === 'POST') {
      if (!authed(request, env)) return json({ error: 'Unauthorized' }, 401);
      if (!env.VAPID_JWK || !env.VAPID_SUBJECT) {
        return json({ error: 'push not configured' }, 503);
      }
      let msg;
      try {
        msg = await request.json();
      } catch {
        return json({ error: 'invalid JSON body' }, 400);
      }
      if (!msg.title) return json({ error: 'title is required' }, 400);

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
        return json({ error: 'VAPID_JWK secret is not valid JSON' }, 500);
      }
      const vapid = { jwk: vapidJwk, subject: env.VAPID_SUBJECT };

      const subsRes = await toDO(
        new Request('https://do/push/subs', { method: 'GET' }),
        env,
        '/push/subs',
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
        );
      }
      return json({ ok: true, sent, pruned: dead.length, errors });
    }

    /* ---------------------------- misc ------------------------------- */
    if (url.pathname === '/health' && request.method === 'GET') {
      return json({
        status: 'ok',
        ts: Date.now(),
        push: !!env.VAPID_JWK,
      });
    }

    return new Response('TINKL API worker is running', {
      status: 200,
      headers: { 'Content-Type': 'text/plain', ...CORS_HEADERS },
    });
  },
};
