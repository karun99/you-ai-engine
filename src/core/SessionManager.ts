import { User, UserSession } from '../types';
import { StorageService } from '../utils/storage';
import { EncryptionService } from '../utils/encryption';

export class SessionManager {
    private storage: StorageService;
    private encryption: EncryptionService;

    constructor(storage: StorageService, encryption: EncryptionService) {
        this.storage = storage;
        this.encryption = encryption;
    }

    public async createSession(user: User, ipAddress?: string, userAgent?: string): Promise<UserSession> {
        const token = this.encryption.generateToken(64);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

        const session: UserSession = {
            userId: user.id,
            email: user.email,
            role: user.role,
            token: token,
            expiresAt: expiresAt,
            ipAddress: ipAddress,
            userAgent: userAgent
        };

        const sessions = this.getSessions();
        sessions.push(session);
        this.saveSessions(sessions);

        return session;
    }

    public async validateSession(token: string): Promise<UserSession | null> {
        const sessions = this.getSessions();
        const session = sessions.find(s => s.token === token);

        if (!session) return null;

        if (new Date(session.expiresAt) < new Date()) {
            this.removeSession(token);
            return null;
        }

        return session;
    }

    public async removeSession(token: string): Promise<void> {
        const sessions = this.getSessions();
        const filtered = sessions.filter(s => s.token !== token);
        this.saveSessions(filtered);
    }

    public async clearAllSessions(): Promise<void> {
        this.saveSessions([]);
    }

    private getSessions(): UserSession[] {
        const data = this.storage.get('sessions');
        if (data) {
            try {
                return JSON.parse(data);
            } catch {
                return [];
            }
        }
        return [];
    }

    private saveSessions(sessions: UserSession[]): void {
        this.storage.set('sessions', JSON.stringify(sessions));
    }
}
