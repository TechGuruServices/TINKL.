// worker/durable-object.js — TinklBackup Durable Object
// Stores (a) the latest backup snapshot and (b) Web Push subscriptions.
// Cloudflare Durable Objects = strongly consistent, low-latency per-user storage.

const MAX_SUBSCRIPTIONS = 50;

export class TinklBackup {
  constructor(state, env) {
    // Works for both legacy KV-backed and new SQLite-backed DOs:
    // both expose `.storage` in the same place.
    this.state = state;
    this.storage = state.storage;
  }

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });

    /* ------------------------- backup snapshot ------------------------- */

    // PUT /backup/latest — client pushes full backup snapshot
    // body: { ts, device, dataVersion, data: { pets, logs, ... } }
    if (path === '/backup/latest' && method === 'PUT') {
      try {
        const body = await req.json();
        await this.storage.put('backup:latest', {
          ts: body.ts || Date.now(),
          device: body.device || 'unknown',
          dataVersion: body.dataVersion || 1,
          data: body.data || {},
        });
        await this.storage.put('backup:meta', {
          lastBackupTime: Date.now(),
          lastBackupDevice: body.device || 'unknown',
          backupCount: (await this.getMetadataCount()) + 1,
        });
        return json({ ok: true, ts: body.ts || Date.now() });
      } catch (err) {
        return json({ error: err.message }, 400);
      }
    }

    // GET /backup/latest — client pulls latest snapshot
    if (path === '/backup/latest' && method === 'GET') {
      try {
        const backup = await this.storage.get('backup:latest');
        if (!backup) return json({ data: null, message: 'No backup found' });
        return json(backup);
      } catch (err) {
        return json({ error: err.message }, 400);
      }
    }

    // GET /backup/metadata
    if (path === '/backup/metadata' && method === 'GET') {
      try {
        const meta = await this.storage.get('backup:meta');
        return json(meta || { backupCount: 0 });
      } catch (err) {
        return json({ error: err.message }, 400);
      }
    }

    // DELETE /backup/latest — user taps "delete cloud data" in settings
    if (path === '/backup/latest' && method === 'DELETE') {
      try {
        await this.storage.delete('backup:latest');
        await this.storage.delete('backup:meta');
        return json({ ok: true });
      } catch (err) {
        return json({ error: err.message }, 400);
      }
    }

    /* ---------------------- push subscriptions ------------------------- */
    // NOTE: the Worker checks Authorization BEFORE forwarding here, so every
    // route below is already authed (except none — all push routes need it).

    // POST /push/subscribe — body: { subscription: { endpoint, keys: { p256dh, auth } } }
    if (path === '/push/subscribe' && method === 'POST') {
      try {
        const { subscription } = await req.json();
        if (
          !subscription?.endpoint ||
          !subscription?.keys?.p256dh ||
          !subscription?.keys?.auth
        ) {
          return json({ error: 'malformed subscription' }, 400);
        }
        const subs = (await this.storage.get('push:subs')) || [];
        const rest = subs.filter((s) => s.endpoint !== subscription.endpoint);
        rest.push({ ...subscription, ts: Date.now() });
        await this.storage.put('push:subs', rest.slice(-MAX_SUBSCRIPTIONS));
        return json({ ok: true, count: Math.min(rest.length, MAX_SUBSCRIPTIONS) });
      } catch (err) {
        return json({ error: err.message }, 400);
      }
    }

    // DELETE /push/subscribe — body: { endpoint }
    if (path === '/push/subscribe' && method === 'DELETE') {
      try {
        const { endpoint, endpoints } = await req.json();
        const doomed = new Set(
          endpoints || (endpoint ? [endpoint] : []),
        );
        const subs = (await this.storage.get('push:subs')) || [];
        const kept = subs.filter((s) => !doomed.has(s.endpoint));
        await this.storage.put('push:subs', kept);
        return json({ ok: true, removed: subs.length - kept.length });
      } catch (err) {
        return json({ error: err.message }, 400);
      }
    }

    // GET /push/subs — list subscriptions (used by worker.js fan-out)
    if (path === '/push/subs' && method === 'GET') {
      try {
        const subs = (await this.storage.get('push:subs')) || [];
        return json({ subs });
      } catch (err) {
        return json({ error: err.message }, 400);
      }
    }

    return new Response('Not found', { status: 404 });
  }

  async getMetadataCount() {
    const meta = await this.storage.get('backup:meta');
    return meta?.backupCount || 0;
  }
}
