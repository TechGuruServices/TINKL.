import { generateKeyPairSync } from 'node:crypto';

/**
 * Generate a VAPID keypair for Web Push (run once per deployment):
 *
 *   node backend/cloudflare/worker/gen-vapid.mjs
 *
 * Then store the outputs as encrypted Worker secrets (never commit them):
 *
 *   npx wrangler secret put VAPID_JWK          # paste the full JWK JSON line
 *   npx wrangler secret put VAPID_PUBLIC_KEY   # paste the base64url line
 *   npx wrangler secret put VAPID_SUBJECT      # e.g. mailto:lucas@techguruofficial.us
 *
 * The PWA fetches VAPID_PUBLIC_KEY at runtime from
 * GET /api/push/vapid-public-key — no secret ever ships to the client.
 */

const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const jwk = privateKey.export({ format: 'jwk' }); // { kty, crv, x, y, d }

const pubRaw = Buffer.concat([
  Buffer.from([0x04]),
  Buffer.from(jwk.x, 'base64url'),
  Buffer.from(jwk.y, 'base64url'),
]);

console.log('VAPID_JWK=' + JSON.stringify(jwk));
console.log('VAPID_PUBLIC_KEY=' + pubRaw.toString('base64url'));
