/**
 * webpush.js — minimal Web Push sender for Cloudflare Workers.
 *
 * Implements RFC 8291 (aes128gcm payload encryption) + RFC 8292 (VAPID
 * authentication) with zero dependencies, using only the Workers WebCrypto
 * API (SubtleCrypto). Used by worker.js to deliver server-driven reminders
 * (medication due, health-radar alerts) even when the PWA is closed.
 *
 * VAPID keys: generate with `node backend/cloudflare/worker/gen-vapid.mjs`,
 * then `npx wrangler secret put VAPID_JWK` (full JWK JSON incl. `d`),
 * `npx wrangler secret put VAPID_PUBLIC_KEY` (base64url, for the client),
 * `npx wrangler secret put VAPID_SUBJECT` (e.g. `mailto:you@domain`).
 */

const enc = new TextEncoder();

function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

function b64urlEncode(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** HKDF-SHA256. `info` is a Uint8Array. */
async function hkdf(ikm, salt, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}

/**
 * Encrypt a plaintext payload for one push subscription (RFC 8291 §3,
 * "aes128gcm"). Returns { body, contentEncoding } ready to POST.
 */
async function encryptAes128Gcm(subscription, plaintext) {
  const uaPublic = b64urlDecode(subscription.keys.p256dh); // 65 bytes, uncompressed
  const authSecret = b64urlDecode(subscription.keys.auth); // 16 bytes
  if (uaPublic.length !== 65 || authSecret.length !== 16) {
    throw new Error('webpush: malformed subscription keys');
  }

  // Ephemeral server ECDH keypair (fresh per message — never reused).
  const eph = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );
  const ephPubRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', eph.publicKey),
  );

  const uaPubKey = await crypto.subtle.importKey(
    'raw',
    uaPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: uaPubKey },
      eph.privateKey,
      256,
    ),
  );

  // key_info = "WebPush: info" || 0x00 || ua_public || as_public (raw bytes)
  const keyInfo = concat(
    enc.encode('WebPush: info\0'),
    uaPublic,
    ephPubRaw,
  );
  // NOTE (aes128gcm): derivation salt is the client's auth_secret, NOT the
  // random header salt. The header salt below is transmitted but unused.
  const prk = await hkdf(ecdhSecret, authSecret, keyInfo, 32);
  const cek = await hkdf(
    prk,
    new Uint8Array(0),
    enc.encode('Content-Encoding: aes128gcm\0'),
    16,
  );
  const nonce = await hkdf(
    prk,
    new Uint8Array(0),
    enc.encode('Content-Encoding: nonce\0'),
    12,
  );

  // Single-record padding: plaintext || 0x02 delimiter.
  const data = enc.encode(plaintext);
  const padded = new Uint8Array(data.length + 1);
  padded.set(data, 0);
  padded[data.length] = 0x02;

  const cekKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, [
    'encrypt',
  ]);
  // AES-GCM appends the 16-byte auth tag to the ciphertext.
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cekKey, padded),
  );

  // Header: salt(16) || rs(4, BE) || idlen(1)=65 || keyid(65) || ciphertext
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096); // record size
  header[20] = 65;
  header.set(ephPubRaw, 21);

  return { body: concat(header, ciphertext) };
}

/** Build the VAPID Authorization header (RFC 8292). */
async function vapidAuthHeader(endpoint, vapidJwk, subject) {
  const url = new URL(endpoint);
  const aud = `${url.protocol}//${url.host}`;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;

  const headerB64 = b64urlEncode(
    enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })),
  );
  const payloadB64 = b64urlEncode(
    enc.encode(JSON.stringify({ aud, exp, sub: subject })),
  );
  const unsigned = `${headerB64}.${payloadB64}`;

  const signKey = await crypto.subtle.importKey(
    'jwk',
    vapidJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      signKey,
      enc.encode(unsigned),
    ),
  );

  // k = base64url(0x04 || x || y)
  const pub = concat(
    new Uint8Array([0x04]),
    b64urlDecode(vapidJwk.x),
    b64urlDecode(vapidJwk.y),
  );
  return `vapid t=${unsigned}.${b64urlEncode(sig)}, k=${b64urlEncode(pub)}`;
}

/**
 * Send one push message.
 * @param {object} subscription  PushSubscription JSON { endpoint, keys:{p256dh, auth} }
 * @param {object} payload       JSON-serialisable — the SW shows title/body/tag/url.
 * @param {object} vapid         { jwk, subject }
 * @returns {{ok:boolean, status:number, gone:boolean}}
 */
export async function sendPush(subscription, payload, vapid) {
  if (!subscription?.endpoint || !subscription?.keys) {
    throw new Error('webpush: invalid subscription');
  }
  const { body } = await encryptAes128Gcm(
    subscription,
    JSON.stringify(payload),
  );
  const auth = await vapidAuthHeader(subscription.endpoint, vapid.jwk, vapid.subject);

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      Authorization: auth,
      TTL: '86400',
    },
    body,
  });
  // 404/410 = subscription expired — caller should delete it.
  return { ok: res.ok, status: res.status, gone: res.status === 404 || res.status === 410 };
}
