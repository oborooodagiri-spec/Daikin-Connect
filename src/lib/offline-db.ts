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

/**
 * Robust wrapper for DB operations.
 * Auto-invalidates the dbPromise if a 'closing' error is detected and retries.
 */
async function withDB<T>(operation: (db: IDBPDatabase<any>) => Promise<T>): Promise<T | null> {
  let db: IDBPDatabase<any> | null = null;
  
  try {
    db = await getDB();
    if (!db) return null;
    return await operation(db);
  } catch (err: any) {
    // If the error suggests the connection is closing/closed, reset and retry once
    const errorMsg = err?.message?.toLowerCase() || "";
    if (errorMsg.includes("closing") || errorMsg.includes("closed")) {
      console.warn("DB connection lost. Attempting to reconnect...", err);
      dbPromise = null; // Invalidate cache
      
      try {
        db = await getDB();
        if (!db) return null;
        return await operation(db);
      } catch (retryErr) {
        console.error("Critical DB failure after retry:", retryErr);
        throw retryErr;
      }
    }
    
    // Otherwise, throw original error
    throw err;
  }
}

export async function savePendingSubmission(submission: Omit<PendingSubmission, 'id' | 'createdAt'>) {
  return withDB(db => 
    db.add(STORE_NAME, {
      ...submission,
      createdAt: Date.now(),
    })
  );
}

export async function getAllPendingSubmissions(): Promise<PendingSubmission[]> {
  const result = await withDB(db => db.getAll(STORE_NAME));
  return result || [];
}

export async function deletePendingSubmission(id: number) {
  return withDB(db => db.delete(STORE_NAME, id));
}

export async function getPendingSubmissionCount(): Promise<number> {
  const count = await withDB(db => db.count(STORE_NAME));
  return count || 0;
}
