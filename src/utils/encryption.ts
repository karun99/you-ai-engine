import CryptoJS from 'crypto-js';

export class EncryptionService {
    private static instance: EncryptionService;
    // In a real production app, this would be an environment variable.
    private readonly encryptionKey: string = 'PERSPECTIVE_AI_2026_SECURE_KEY_9x1m4k2n';

    private constructor() {}

    public static getInstance(): EncryptionService {
        if (!EncryptionService.instance) {
            EncryptionService.instance = new EncryptionService();
        }
        return EncryptionService.instance;
    }

    public encryptData(data: any): string {
        try {
            const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
            return CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
        } catch (error) {
            throw new Error('Encryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    public decryptData(ciphertext: string): any {
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            try {
                return JSON.parse(decrypted);
            } catch {
                return decrypted;
            }
        } catch (error) {
            throw new Error('Decryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    public hashData(data: any): string {
        const stringData = typeof data === 'string' ? data : JSON.stringify(data);
        return CryptoJS.SHA256(stringData).toString();
    }

    public hashPassword(password: string): string {
        return CryptoJS.SHA256(password).toString();
    }

    public generateToken(length: number = 32): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    public verifyIntegrity(data: any, hash: string): boolean {
        const calculatedHash = this.hashData(data);
        return calculatedHash === hash;
    }

    public generateIV(): string {
        return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
    }
}
