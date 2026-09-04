import { EncryptionService } from './encryption';
import { FileSystemStorage } from './file-storage';

export class StorageService {
    private static instance: StorageService;
    private encryption: EncryptionService;
    private storageBackend: any;

    private constructor() {
        this.encryption = EncryptionService.getInstance();
        
        // Detect environment and select storage backend
        if (typeof window === 'undefined') {
            this.storageBackend = new FileSystemStorage();
        } else {
            this.storageBackend = window.localStorage;
        }
    }

    public static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    /**
     * Sets a value in Storage with AES-256 encryption and a SHA-256 integrity hash.
     */
    public set(key: string, value: string): void {
        try {
            const encrypted = this.encryption.encryptData(value);
            this.storageBackend.setItem(key, encrypted);
            
            const hash = this.encryption.hashData(value);
            this.storageBackend.setItem(key + '_hash', hash);
        } catch (error) {
            console.error(`StorageService.set error for key ${key}:`, error);
        }
    }

    /**
     * Retrieves a value from Storage, decrypts it, and verifies its integrity.
     */
    public get(key: string): string | null {
        try {
            const encrypted = this.storageBackend.getItem(key);
            if (!encrypted) return null;

            const storedHash = this.storageBackend.getItem(key + '_hash');
            const decrypted = this.encryption.decryptData(encrypted);

            // If decryption returned an object (via JSON.parse), stringify it for hash check
            const decryptedString = typeof decrypted === 'string' ? decrypted : JSON.stringify(decrypted);

            if (storedHash) {
                const calculatedHash = this.encryption.hashData(decryptedString);
                if (calculatedHash !== storedHash) {
                    console.warn('Data integrity check failed for key:', key);
                    return null;
                }
            }

            return decryptedString;
        } catch (error) {
            console.error(`StorageService.get error for key ${key}:`, error);
            return null;
        }
    }

    public remove(key: string): void {
        this.storageBackend.removeItem(key);
        this.storageBackend.removeItem(key + '_hash');
    }

    public clear(): void {
        const keysToKeep = ['users', 'projects', 'sessions', 'activity_logs'];
        const allKeys = this.storageBackend.keys ? this.storageBackend.keys() : Object.keys(localStorage);
        for (const key of allKeys) {
            if (!keysToKeep.some(k => key.startsWith(k))) {
                this.storageBackend.removeItem(key);
                this.storageBackend.removeItem(key + '_hash');
            }
        }
    }

    public getAllKeys(): string[] {
        // Filter out the hash keys from the returned list
        const keys = this.storageBackend.keys ? this.storageBackend.keys() : Object.keys(localStorage);
        return keys.filter((key: string) => !key.endsWith('_hash'));
    }

    public getSize(): number {
        let total = 0;
        const keys = this.getAllKeys();
        for (const key of keys) {
            const value = this.storageBackend.getItem(key);
            if (value) {
                total += value.length * 2; // Approximate bytes
            }
        }
        return total;
    }

    /**
     * Handles storage of larger data using Blob/IndexedDB concepts (simplified here for prototype).
     * In a full implementation, this would use the IndexedDB API.
     */
    public async storeBlob(key: string, data: any): Promise<void> {
        const blobData = JSON.stringify(data);
        this.set('blob_' + key, blobData);
    }

    public async getBlob(key: string): Promise<any | null> {
        const data = this.get('blob_' + key);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }
}
