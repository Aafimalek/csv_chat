export const DB_NAME = 'QueryCSV_DB';
export const STORE_NAME = 'files';
export const DB_VERSION = 1;

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event);
            reject("Error opening database");
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'name' });
            }
        };
    });
};

export const saveFileToDB = async (file: File): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // We store the file object directly. IndexedDB supports storing Blobs/Files.
        const request = store.put(file);

        request.onsuccess = () => resolve();
        request.onerror = () => reject("Error saving file");
    });
};

export const getFileFromDB = async (fileName: string): Promise<File | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(fileName);

        request.onsuccess = () => {
            resolve(request.result as File | undefined);
        };
        request.onerror = () => reject("Error retrieving file");
    });
};
