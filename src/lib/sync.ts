import axios from 'axios';
import Cookies from 'js-cookie';
import { AUTH_COOKIE_NAME } from '@/constants/auth';
import { 
  getUnsyncedVitals, markVitalSynced, removeVitalSyncRecord,
  getUnsyncedMedications, markMedicationSynced, removeMedicationSyncRecord 
} from './db';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getAuthHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function syncVitals() {
  if (!navigator.onLine) {
    console.log('[Sync] Offline - will sync vitals later');
    return;
  }
  
  const unsynced = await getUnsyncedVitals();
  if (unsynced.length === 0) return;
  
  console.log(`[Sync] Syncing ${unsynced.length} vital records...`);
  const headers = getAuthHeaders();
  
  for (const record of unsynced) {
    try {
      await axios.post(`${BASE_URL}/patient/tracking`, record.payload, { headers });
      await markVitalSynced(record.syncId);
      // Optional: remove after sync
      await removeVitalSyncRecord(record.syncId);
      console.log(`[Sync] Successfully synced vital record: ${record.syncId}`);
    } catch (error) {
      console.error(`[Sync] Failed to sync vital record: ${record.syncId}`, error);
    }
  }
}

export async function syncMedications() {
  if (!navigator.onLine) {
    console.log('[Sync] Offline - will sync medications later');
    return;
  }
  
  const unsynced = await getUnsyncedMedications();
  if (unsynced.length === 0) return;
  
  console.log(`[Sync] Syncing ${unsynced.length} medication logs...`);
  const headers = getAuthHeaders();
  
  for (const record of unsynced) {
    try {
      await axios.post(`${BASE_URL}/patient/medications/track`, record.payload, { headers });
      await markMedicationSynced(record.syncId);
      await removeMedicationSyncRecord(record.syncId);
      console.log(`[Sync] Successfully synced medication log: ${record.syncId}`);
    } catch (error) {
      console.error(`[Sync] Failed to sync medication log: ${record.syncId}`, error);
    }
  }
}

export async function syncAll() {
  await Promise.all([syncVitals(), syncMedications()]);
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Back online! Triggering background sync...');
    syncAll();
  });
}
