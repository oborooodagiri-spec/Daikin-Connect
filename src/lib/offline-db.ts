import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'daikin_offline_db';
const STORE_NAME = 'pending_submissions';
const DB_VERSION = 1;

export interface PendingSubmission {
  id?: number;
  type: 'CORRECTIVE' | 'PREVENTIVE' | 'AUDIT';
  data: any;
  photos: Blob[];
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function savePendingSubmission(submission: Omit<PendingSubmission, 'id' | 'createdAt'>) {
  const db = await getDB();
  if (!db) return;
  return db.add(STORE_NAME, {
    ...submission,
    createdAt: Date.now(),
  });
}

export async function getAllPendingSubmissions(): Promise<PendingSubmission[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll(STORE_NAME);
}

export async function deletePendingSubmission(id: number) {
  const db = await getDB();
  if (!db) return;
  return db.delete(STORE_NAME, id);
}

export async function getPendingSubmissionCount() {
  const db = await getDB();
  if (!db) return 0;
  return db.count(STORE_NAME);
}
