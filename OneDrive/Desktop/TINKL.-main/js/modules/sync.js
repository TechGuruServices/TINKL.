// Cloud Sync (Durable Objects) — extracted from legacy.js lines 365-573.

import { DB } from './db.js';
import { U, loadAll } from './utils.js';
import { render, currentView } from './navigation.js';

/* ================ Cloud Sync (Durable Objects) ================ */
const SYNC = {
  // Configuration.
  // There is deliberately NO shared secret here: anything shipped in the
  // app is public, so a shared secret cannot protect anyone's backup.
  // Instead each device generates its own random sync credential (below)
  // and the Worker scopes every backup to a hash of that credential.
  WORKER_URL: window.TINKL_CONFIG?.WORKER_URL || 'https://tinkl-sync.techguruofficial.workers.dev',

  SYNC_INTERVAL_MS: 5 * 60 * 1000, // Auto-sync every 5 minutes (optional)
  DEVICE_ID: null, // Set on app init
  DATA_VERSION: 1, // Bump this if you change the data schema
  CREDENTIAL_KEY: 'tinkl_sync_credential', // localStorage key

  /** A sync credential is 32 random bytes as 64 lowercase hex chars. */
  isValidCredential(code) {
    return typeof code === 'string' && /^[0-9a-f]{64}$/.test(code);
  },

  /**
   * This device's sync credential, generated on first use and kept only
   * in localStorage. It is the ONLY key to this device's cloud backup:
   * the Worker derives the storage location from a hash of it, so the
   * credential itself is never stored on the server.
   */
  getCredential() {
    let code = localStorage.getItem(this.CREDENTIAL_KEY);
    if (!this.isValidCredential(code)) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      code = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(this.CREDENTIAL_KEY, code);
    }
    return code;
  },

  authHeaders() {
    return { Authorization: `Bearer ${this.getCredential()}` };
  },

  /**
   * Show the recovery code so the user can move their cloud backup to a
   * new device. Anyone holding the code can read that backup — the dialog
   * says so, in the app's own confirm style.
   */
  async showRecoveryCode() {
    const code = this.getCredential();
    try {
      await navigator.clipboard.writeText(code);
    } catch { /* clipboard is a convenience, not a requirement */ }
    await U.confirm(
      'Cloud Backup Recovery Code',
      `${code}\n\nThis code is the only key to your cloud backup — there is no account and no password reset. Enter it on a new device (Settings → Cloud Sync → Use a Recovery Code) to restore there.\n\nKeep it somewhere private: anyone with this code can read your cloud backup. The code has been copied to your clipboard.`,
    );
  },

  /** Adopt a recovery code from another device as this device's key. */
  async importRecoveryCode() {
    const entered = window.prompt('Paste the recovery code from your other device:');
    if (!entered) return;
    const code = entered.trim().toLowerCase();
    if (!this.isValidCredential(code)) {
      U.toast('That code does not look right — it is 64 characters, using only a–f and 0–9.', 'error');
      return;
    }
    localStorage.setItem(this.CREDENTIAL_KEY, code);
    U.toast('Recovery code saved. Tap “Restore from Cloud” to pull your backup.', 'success');
  },

  async init() {
    // Generate a stable device ID (stored in localStorage)
    this.DEVICE_ID = localStorage.getItem('tinkl_device_id');
    if (!this.DEVICE_ID) {
      this.DEVICE_ID = `device_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('tinkl_device_id', this.DEVICE_ID);
    }

    // Start auto-sync in background (optional — user can also tap "Sync Now" button)
    setInterval(() => this.autoSync(), this.SYNC_INTERVAL_MS);
    console.log('[SYNC] Initialized. Device ID:', this.DEVICE_ID);
  },

  /**
   * Serialize all app data into a backup object
   * Called before pushing to cloud or importing from cloud
   */
  async serialize() {
    return {
      ts: Date.now(),
      device: this.DEVICE_ID,
      dataVersion: this.DATA_VERSION,
      data: {
        pets: await DB.all('pets'),
        logs: await DB.all('logs'),
        reminders: await DB.all('reminders'),
        meds: await DB.all('meds'),
        vaccinations: await DB.all('vaccinations'),
        weights: await DB.all('weights'),
        notes: await DB.all('notes'),
        settings: JSON.parse(localStorage.getItem('tinkl_settings') || '{}'),
        activePetId: localStorage.getItem('tinkl_active'),
      },
    };
  },

  /**
   * Push local data to cloud
   * Call this when user taps "Back Up to Cloud" button
   */
  async pushToCloud() {
    try {
      const backup = await this.serialize();
      const res = await fetch(`${this.WORKER_URL}/api/backup/latest`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getCredential()}`,
        },
        body: JSON.stringify(backup),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      localStorage.setItem('tinkl_last_sync_push', String(Date.now()));
      console.log('[SYNC] Pushed to cloud:', result);
      U.toast('✅ Backed up to cloud', 'success');
      return result;
    } catch (err) {
      console.error('[SYNC] Push failed:', err);
      // Offline: queue a background sync so the service worker nudges the
      // app to flush this backup when connectivity returns.
      if (!navigator.onLine && 'serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then((reg) => reg.sync.register('tinkl-backup'))
          .catch(() => {});
      }
      U.toast(`❌ Backup failed: ${err.message}`, 'error');
      throw err;
    }
  },

  /**
   * Pull data from cloud
   * Call this when user taps "Restore from Cloud" button
   */
  async pullFromCloud() {
    try {
      const res = await fetch(`${this.WORKER_URL}/api/backup/latest`, {
        method: 'GET',
        headers: this.authHeaders(),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const backup = await res.json();

      if (!backup || !backup.data) {
        U.toast('No cloud backup found', 'info');
        return null;
      }

      console.log('[SYNC] Pulled from cloud:', backup);
      return backup;
    } catch (err) {
      console.error('[SYNC] Pull failed:', err);
      U.toast(`❌ Restore failed: ${err.message}`, 'error');
      throw err;
    }
  },

  /**
   * Merge strategy: pull cloud data, compare timestamps, keep newer
   * This is safe for pet care data: each entry (log, reminder, pet) has
   * a unique ID and timestamp. If both local and cloud have the same ID,
   * keep the newer one. Anything only in cloud is imported.
   */
  async merge(cloudBackup) {
    if (!cloudBackup || !cloudBackup.data) return;

    // Enterprise Guardrail: Version Check
    // Prevent restoring data from a future app version that may have a different schema.
    if (cloudBackup.dataVersion > this.DATA_VERSION) {
      const ok = await U.confirm(
        'Version Mismatch',
        `The cloud backup is from a newer version of TINKL (v${cloudBackup.dataVersion}) than your current app (v${this.DATA_VERSION}). Restoring may cause stability issues. Proceed anyway?`
      );
      if (!ok) {
        U.toast('Restore cancelled due to version mismatch', 'info');
        return;
      }
    }

    const cloud = cloudBackup.data;
    const mergeTable = async (storeName, table) => {
      if (!Array.isArray(table)) return;
      for (const item of table) {
        const existing = await this.getByIdFromStore(storeName, item.id);
        // Keep newer timestamp (ts or at field depending on table)
        const itemTs = item.ts || item.at || 0;
        const existingTs = existing?.ts || existing?.at || 0;
        if (!existing || itemTs > existingTs) {
          await DB.put(storeName, item);
        }
      }
    };

    // Merge each table
    await mergeTable('pets', cloud.pets);
    await mergeTable('logs', cloud.logs);
    await mergeTable('reminders', cloud.reminders);
    await mergeTable('meds', cloud.meds);
    await mergeTable('vaccinations', cloud.vaccinations);
    await mergeTable('weights', cloud.weights);
    await mergeTable('notes', cloud.notes);

    // Merge settings (cloud wins, or merge strategically)
    if (cloud.settings) {
      const local = JSON.parse(localStorage.getItem('tinkl_settings') || '{}');
      Object.assign(local, cloud.settings);
      localStorage.setItem('tinkl_settings', JSON.stringify(local));
    }

    localStorage.setItem('tinkl_last_sync_pull', String(Date.now()));
    console.log('[SYNC] Merged cloud data into local');
  },

  /**
   * Auto-sync: every SYNC_INTERVAL_MS, push local → cloud if changed
   * (You can make this smarter: only push if data actually changed)
   */
  async autoSync() {
    const lastPush = Number(localStorage.getItem('tinkl_last_sync_push') || 0);
    const now = Date.now();
    if (now - lastPush > this.SYNC_INTERVAL_MS) {
      try {
        await this.pushToCloud();
      } catch {
        // Silently fail, will retry next interval
        console.warn('[SYNC] Auto-sync push failed, will retry');
      }
    }
  },

  /**
   * Helper: get an item by ID from a store
   */
  async getByIdFromStore(storeName, id) {
    return new Promise((res, rej) => {
      const req = DB.tx(storeName).get(id);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  },

  /**
   * Full restore: pull from cloud, ask user, merge if approved
   */
  async restoreFromCloud() {
    const backup = await this.pullFromCloud();
    if (!backup) return;

    const msg = `Cloud backup from ${new Date(backup.ts).toLocaleDateString()} (${backup.device}).\n\nMerge with local data? Newer entries win.`;
    const ok = await U.confirm('Restore Cloud Backup', msg);
    if (ok) {
      await this.merge(backup);
      await loadAll();
      render(currentView());
      U.toast('✅ Restored from cloud', 'success');
    }
  },

  /**
   * Delete cloud backup (user privacy)
   */
  async deleteCloudBackup() {
    const ok = await U.confirm('Delete Cloud Backup', 'This cannot be undone.');
    if (!ok) return;
    try {
      const res = await fetch(`${this.WORKER_URL}/api/backup/latest`, {
        method: 'DELETE',
        headers: this.authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      U.toast('✅ Cloud backup deleted', 'success');
    } catch (err) {
      U.toast(`❌ Delete failed: ${err.message}`, 'error');
    }
  },
};

export { SYNC };
