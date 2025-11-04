import { openDB, IDBPDatabase } from 'idb';
import { ConcreteReport } from '../types.ts';

const DB_NAME = 'ConcreteQualityDB';
const DB_VERSION = 1;
const STORE_NAME = 'reports';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDb = (): Promise<IDBPDatabase> => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'uniqueRefNo' });
                }
            },
        });
    }
    return dbPromise;
};

export async function saveReport(report: ConcreteReport): Promise<string> {
    const db = await getDb();
    return db.put(STORE_NAME, report);
}

export async function getReport(uniqueRefNo: string): Promise<ConcreteReport | undefined> {
    const db = await getDb();
    return db.get(STORE_NAME, uniqueRefNo);
}

export async function getAllReports(): Promise<ConcreteReport[]> {
    const db = await getDb();
    return db.getAll(STORE_NAME);
}

export async function deleteReport(uniqueRefNo: string): Promise<void> {
    const db = await getDb();
    return db.delete(STORE_NAME, uniqueRefNo);
}

export async function clearAllReports(): Promise<void> {
    const db = await getDb();
    return db.clear(STORE_NAME);
}
