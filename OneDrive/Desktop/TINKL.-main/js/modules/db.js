// IndexedDB wrapper — extracted from legacy.js lines 94-115.

/* ================ IndexedDB ================ */
const DB = {
  db: null, name: 'TINKL_V2', ver: 1,
  async init() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(this.name, this.ver);
      r.onerror = () => rej(r.error);
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onupgradeneeded = (e) => {
        const db = e.target.result;
        ['pets', 'logs', 'reminders', 'weights', 'meds', 'vaccinations', 'notes'].forEach(s => {
          if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
        });
      };
    });
  },
  tx(s, m = 'readonly') { return this.db.transaction(s, m).objectStore(s); },
  all(s) { return new Promise((r, e) => { const q = this.tx(s).getAll(); q.onsuccess = () => r(q.result || []); q.onerror = () => e(q.error); }); },
  put(s, v) { return new Promise((r, e) => { const q = this.tx(s, 'readwrite').put(v); q.onsuccess = () => r(); q.onerror = () => e(q.error); }); },
  del(s, id) { return new Promise((r, e) => { const q = this.tx(s, 'readwrite').delete(id); q.onsuccess = () => r(); q.onerror = () => e(q.error); }); },
  clear(s) { return new Promise((r, e) => { const q = this.tx(s, 'readwrite').clear(); q.onsuccess = () => r(); q.onerror = () => e(q.error); }); }
};

export { DB };
