import { idbQueue } from "@/lib/storage/idb-queue";

const DB_NAME = "eye-finder-v1";
const DB_VERSION = 1;
const STORE = "kv";

let activeDb: IDBDatabase | null = null;

export function closeDB(): void {
  if (activeDb) {
    activeDb.close();
    activeDb = null;
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    if (activeDb) {
      resolve(activeDb);
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => {
      activeDb = req.result;
      activeDb.onclose = () => {
        activeDb = null;
      };
      resolve(activeDb);
    };
    req.onerror = () => reject(req.error);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} zaman aşımı`)), ms),
    ),
  ]);
}

export async function idbGet<T>(key: string): Promise<T | null> {
  return idbQueue(() => idbGetInner<T>(key));
}

async function idbGetInner<T>(key: string): Promise<T | null> {
  const db = await openDB();
  const read = new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB get failed"));
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB read failed"));
  });

  return withTimeout(read, 5000, "IndexedDB okuma");
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  return idbQueue(() => idbSetInner(key, value));
}

async function idbSetInner(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  const write = new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put(value, key);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB put failed"));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
  });

  return withTimeout(write, 8000, "IndexedDB yazma");
}

export async function idbDelete(key: string): Promise<void> {
  return idbQueue(() => idbDeleteInner(key));
}

async function idbDeleteInner(key: string): Promise<void> {
  const db = await openDB();
  const del = new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return withTimeout(del, 5000, "IndexedDB silme");
}

export async function idbClear(): Promise<void> {
  return idbQueue(() => idbClearInner());
}

async function idbClearInner(): Promise<void> {
  const db = await openDB();
  const clear = new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return withTimeout(clear, 8000, "IndexedDB temizleme");
}

/** Store'u temizler — deleteDatabase'den daha güvenli */
export async function idbResetStore(): Promise<void> {
  closeDB();
  try {
    await idbClear();
  } catch {
    /* boş veya kapalı DB */
  } finally {
    closeDB();
  }
}

/** Tüm veritabanını kaldırır (zaman aşımı korumalı) */
export async function idbDestroy(): Promise<void> {
  closeDB();
  if (typeof indexedDB === "undefined") return;

  const deleteDb = () =>
    new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => {
        closeDB();
        setTimeout(resolve, 300);
      };
    });

  await Promise.race([
    deleteDb(),
    new Promise<void>((resolve) => setTimeout(resolve, 4000)),
  ]);
  closeDB();
}
