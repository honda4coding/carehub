import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'carehub-db';
const DB_VERSION = 3;

let dbInstance: IDBPDatabase | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Data stores for displaying offline
      if (!db.objectStoreNames.contains('vitals_data')) {
        db.createObjectStore('vitals_data', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('medications_active')) {
        db.createObjectStore('medications_active', { keyPath: 'medicationId' });
      }
      if (!db.objectStoreNames.contains('medications_history')) {
        db.createObjectStore('medications_history', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('medications_summary')) {
        db.createObjectStore('medications_summary', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('medications_past')) {
        db.createObjectStore('medications_past', { keyPath: 'medicineName' });
      }

      // Sync queues for offline actions
      if (!db.objectStoreNames.contains('vitals_sync_queue')) {
        const vitalsStore = db.createObjectStore('vitals_sync_queue', { keyPath: 'syncId' });
        vitalsStore.createIndex('by-synced', 'synced');
      }
      if (!db.objectStoreNames.contains('medications_sync_queue')) {
        const medsStore = db.createObjectStore('medications_sync_queue', { keyPath: 'syncId' });
        medsStore.createIndex('by-synced', 'synced');
      }
    },
  });
  return dbInstance;
}

// --- Vitals Operations ---
export async function saveVitalsData(records: any[]) {
  const db = await getDB();
  const tx = db.transaction('vitals_data', 'readwrite');
  await tx.objectStore('vitals_data').clear();
  for (const record of records) {
    if (record._id) await tx.objectStore('vitals_data').put(record);
  }
  await tx.done;
}

export async function getLocalVitalsData() {
  const db = await getDB();
  return db.getAll('vitals_data');
}

export async function queueVitalSync(payload: any) {
  const db = await getDB();
  
  // Inject the auth token for the Service Worker
  let token = "";
  if (typeof window !== "undefined") {
    // Cannot import Cookies here easily if it causes circular dependency, we'll read document.cookie directly or use standard
    const match = document.cookie.match(new RegExp('(^| )' + 'auth_token' + '=([^;]+)'));
    if (match) token = match[2];
  }
  
  const syncRecord = {
    syncId: crypto.randomUUID(),
    payload,
    timestamp: Date.now(),
    synced: false,
    authToken: token
  };
  await db.add('vitals_sync_queue', syncRecord);
  return syncRecord;
}

export async function getUnsyncedVitals() {
  const db = await getDB();
  const all = await db.getAll('vitals_sync_queue');
  return all.filter((r: any) => !r.synced).sort((a, b) => a.timestamp - b.timestamp);
}

export async function markVitalSynced(syncId: string) {
  const db = await getDB();
  const record = await db.get('vitals_sync_queue', syncId);
  if (record) {
    record.synced = true;
    await db.put('vitals_sync_queue', record);
  }
}

export async function removeVitalSyncRecord(syncId: string) {
  const db = await getDB();
  await db.delete('vitals_sync_queue', syncId);
}

// --- Medications Operations ---
export async function saveMedicationsData(active: any[], history: any[], summary: any, past: any[] = []) {
  const db = await getDB();
  
  const txActive = db.transaction('medications_active', 'readwrite');
  await txActive.objectStore('medications_active').clear();
  for (const med of active) {
    if (med.medicationId) await txActive.objectStore('medications_active').put(med);
  }
  await txActive.done;

  const txHistory = db.transaction('medications_history', 'readwrite');
  await txHistory.objectStore('medications_history').clear();
  for (const record of history) {
    if (record._id) await txHistory.objectStore('medications_history').put(record);
  }
  await txHistory.done;

  const txSummary = db.transaction('medications_summary', 'readwrite');
  await txSummary.objectStore('medications_summary').clear();
  if (summary) {
    await txSummary.objectStore('medications_summary').put({ id: 'summary', ...summary });
  }
  await txSummary.done;

  const txPast = db.transaction('medications_past', 'readwrite');
  await txPast.objectStore('medications_past').clear();
  for (const med of past) {
    if (med.medicineName) await txPast.objectStore('medications_past').put(med);
  }
  await txPast.done;
}

export async function getLocalMedicationsData() {
  const db = await getDB();
  const active = await db.getAll('medications_active');
  const history = await db.getAll('medications_history');
  const summaryWrapper = await db.get('medications_summary', 'summary');
  const past = await db.getAll('medications_past');
  return { 
    active, 
    history, 
    past: past || [],
    summary: summaryWrapper ? { ...summaryWrapper, id: undefined } : null 
  };
}

export async function queueMedicationSync(payload: any) {
  const db = await getDB();

  let token = "";
  if (typeof window !== "undefined") {
    const match = document.cookie.match(new RegExp('(^| )' + 'auth_token' + '=([^;]+)'));
    if (match) token = match[2];
  }

  const syncRecord = {
    syncId: crypto.randomUUID(),
    payload,
    timestamp: Date.now(),
    synced: false,
    authToken: token
  };
  await db.add('medications_sync_queue', syncRecord);
  return syncRecord;
}

export async function getUnsyncedMedications() {
  const db = await getDB();
  const all = await db.getAll('medications_sync_queue');
  return all.filter((r: any) => !r.synced).sort((a, b) => a.timestamp - b.timestamp);
}

export async function markMedicationSynced(syncId: string) {
  const db = await getDB();
  const record = await db.get('medications_sync_queue', syncId);
  if (record) {
    record.synced = true;
    await db.put('medications_sync_queue', record);
  }
}

export async function removeMedicationSyncRecord(syncId: string) {
  const db = await getDB();
  await db.delete('medications_sync_queue', syncId);
}
