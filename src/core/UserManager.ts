import { User, UserUpdate } from '../types';
import { StorageService } from '../utils/storage';
import { EncryptionService } from '../utils/encryption';

export class UserManager {
    private storage: StorageService;
    private encryption: EncryptionService;

    constructor(storage: StorageService, encryption: EncryptionService) {
        this.storage = storage;
        this.encryption = encryption;
    }

    public async getAllUsers(): Promise<User[]> {
        return this.getUsers();
    }

    public async getUser(id: string): Promise<User | null> {
        const users = this.getUsers();
        return users.find(u => u.id === id) || null;
    }

    public async getUserByEmail(email: string): Promise<User | null> {
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    public async updateUser(id: string, updates: UserUpdate): Promise<User | null> {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return null;
        }

        const user = users[index];

        if (updates.name) user.name = updates.name;
        if (updates.email) user.email = updates.email.toLowerCase();
        if (updates.role) user.role = updates.role;
        if (updates.status) user.status = updates.status;
        if (updates.preferences) {
            user.preferences = { ...user.preferences, ...updates.preferences };
        }

        users[index] = user;
        this.saveUsers(users);

        return user;
    }

    public async deleteUser(id: string): Promise<boolean> {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== id);

        if (filtered.length === users.length) {
            return false;
        }

        this.saveUsers(filtered);
        return true;
    }

    public async getUsersByRole(role: 'user' | 'admin'): Promise<User[]> {
        const users = this.getUsers();
        return users.filter(u => u.role === role);
    }

    public async getActiveUsers(): Promise<User[]> {
        const users = this.getUsers();
        return users.filter(u => u.status === 'active');
    }

    public async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<User | null> {
        return this.updateUser(id, { status });
    }

    private getUsers(): User[] {
        const data = this.storage.get('users');
        if (data) {
            try {
                return JSON.parse(data);
            } catch {
                return [];
            }
        }
        return [];
    }

    private saveUsers(users: User[]): void {
        this.storage.set('users', JSON.stringify(users));
    }
}
