import axios from 'axios';
import { 
  getUnsyncedVitals, markVitalSynced, removeVitalSyncRecord,
  getUnsyncedMedications, markMedicationSynced, removeMedicationSyncRecord 
} from './db';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function syncVitals() {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => 
          setTimeout(() => resolve(null), 1000)
        )
      ]);
      if (registration) {
        await registration.sync.register("sync-vitals");
        console.log(`[PWA Sync] Tag 'sync-vitals' registered successfully.`);
        return;
      }
      console.log("[PWA Sync] Service Worker ready timed out. Running fallback...");
    } catch (err) {
      console.error("[PWA Sync] Background Sync registration failed, running fallback...", err);
    }
  } else {
    console.log("[PWA Sync] Background Sync not supported. Setting up Fallback...");
  }
  // Fallback for Safari/iOS
  await runVitalsFallback();
}

export async function syncMedications() {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => 
          setTimeout(() => resolve(null), 1000)
        )
      ]);
      if (registration) {
        await registration.sync.register("sync-medications");
        console.log(`[PWA Sync] Tag 'sync-medications' registered successfully.`);
        return;
      }
      console.log("[PWA Sync] Service Worker ready timed out. Running fallback...");
    } catch (err) {
      console.error("[PWA Sync] Background Sync registration failed, running fallback...", err);
    }
  }
  // Fallback for Safari/iOS
  await runMedicationsFallback();
}

export async function syncAll() {
  await Promise.all([syncVitals(), syncMedications()]);
}

async function runVitalsFallback() {
  if (!navigator.onLine) return;
  const unsynced = await getUnsyncedVitals();
  if (unsynced.length === 0) return;
  
  console.log(`[Sync Fallback] Syncing ${unsynced.length} vital records...`);
  for (const record of unsynced) {
    try {
      await axios.post(`${BASE_URL}/patient/tracking`, record.payload, {
        headers: record.authToken ? { Authorization: `Bearer ${record.authToken}` } : {}
      });
      await markVitalSynced(record.syncId);
      await removeVitalSyncRecord(record.syncId);
      console.log(`[Sync Fallback] Successfully synced vital record: ${record.syncId}`);
    } catch (error) {
      console.error(`[Sync Fallback] Failed to sync vital record. Halting loop.`, error);
      break;
    }
  }
}

async function runMedicationsFallback() {
  if (!navigator.onLine) return;
  const unsynced = await getUnsyncedMedications();
  if (unsynced.length === 0) return;
  
  console.log(`[Sync Fallback] Syncing ${unsynced.length} medication logs...`);
  for (const record of unsynced) {
    try {
      await axios.post(`${BASE_URL}/patient/medications/track`, record.payload, {
        headers: record.authToken ? { Authorization: `Bearer ${record.authToken}` } : {}
      });
      await markMedicationSynced(record.syncId);
      await removeMedicationSyncRecord(record.syncId);
      console.log(`[Sync Fallback] Successfully synced medication log: ${record.syncId}`);
    } catch (error) {
      console.error(`[Sync Fallback] Failed to sync medication log. Halting loop.`, error);
      break;
    }
  }
}

// Auto-sync when coming back online (for Safari Fallback)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Back online! Triggering Safari fallback sync...');
    syncAll();
  });
}
