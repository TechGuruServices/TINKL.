/* ============================================================================
 * vetShare.js — shareable read-only "Vet Pass" payload for the Tinkle PWA.
 *
 * Zero imports. Compresses a compact vet-report payload with the vendored
 * lz-string build (js/vendor/lz-string.min.js) into a URL-safe string that
 * vetpass.html decodes and renders read-only.
 *
 * LZString is accessed defensively: it may be a bare global (classic
 * <script>), window.LZString, or globalThis.LZString. buildVetSharePayload
 * THROWS a descriptive error when the library is missing (the caller shows
 * a toast); decodeVetSharePayload returns null on any failure.
 *
 * Payload is kept compact: pet {id,name,species,breed}, logs = last 30 days
 * trimmed to {t: type, ts}, radar flags as-is, report text string.
 * Optional enrichment: pass `meds` and `weights` arrays and they are
 * trimmed to {name,dose,schedule} / {ts,v(value),u(unit)} respectively.
 * ========================================================================== */

function getLZ() {
  if (typeof LZString !== 'undefined' && LZString) return LZString; // eslint-disable-line no-undef
  if (typeof window !== 'undefined' && window.LZString) return window.LZString;
  if (typeof globalThis !== 'undefined' && globalThis.LZString) return globalThis.LZString;
  return null;
}

const DAY = 86400000;

/* ------------------------------------------------------------------ */
/** Build the compressed, URL-safe Vet Pass payload string.
 *  Input: { pet, logs, radarFlags, vetReportText, generatedAt,
 *           meds? (raw med rows), weights? (raw weight rows) } */
export function buildVetSharePayload(input) {
  const LZ = getLZ();
  if (!LZ || typeof LZ.compressToEncodedURIComponent !== 'function') {
    throw new Error('vetShare: LZString library not loaded — include js/vendor/lz-string.min.js first.');
  }
  const { pet = {}, logs = [], radarFlags = [], vetReportText = '', generatedAt, meds, weights } = input || {};
  const gen = typeof generatedAt === 'number' ? generatedAt : Date.now();
  const cutoff = gen - 30 * DAY;

  const petLogs = (Array.isArray(logs) ? logs : [])
    .filter(l => l && l.petId === pet.id && typeof l.ts === 'number' && l.ts >= cutoff && l.ts <= gen)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 500) // hard cap keeps the ?d= URL shareable
    .map(l => ({ t: l.type, ts: l.ts }));

  const payload = {
    v: 1,
    pet: { id: pet.id, name: pet.name, species: pet.species, breed: pet.breed },
    logs: petLogs,
    flags: Array.isArray(radarFlags) ? radarFlags : [],
    report: String(vetReportText || ''),
    gen,
  };

  if (Array.isArray(meds)) {
    payload.meds = meds
      .filter(m => m && m.petId === pet.id && m.name)
      .map(m => ({ name: m.name, dose: m.dose || '', schedule: m.schedule || '' }));
  }
  if (Array.isArray(weights)) {
    payload.weights = weights
      .filter(w => w && w.petId === pet.id && typeof w.ts === 'number')
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 24)
      .map(w => ({ ts: w.ts, v: w.value, u: w.unit || 'kg' }));
  }

  return LZ.compressToEncodedURIComponent(JSON.stringify(payload));
}

/* ------------------------------------------------------------------ */
/** Decode a Vet Pass payload string. Returns the payload object or null. */
export function decodeVetSharePayload(str) {
  try {
    const LZ = getLZ();
    if (!LZ || typeof LZ.decompressFromEncodedURIComponent !== 'function') return null;
    if (typeof str !== 'string' || !str.length) return null;
    const json = LZ.decompressFromEncodedURIComponent(str);
    if (!json) return null;
    const o = JSON.parse(json);
    return o && typeof o === 'object' && o.pet ? o : null;
  } catch {
    return null;
  }
}
