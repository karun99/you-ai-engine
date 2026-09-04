import { User, UserRegistration, UserLogin } from '../types';
import { StorageService } from '../utils/storage';
import { EncryptionService } from '../utils/encryption';
import { ValidatorService } from '../utils/validators';

export class AuthManager {
    private storage: StorageService;
    private encryption: EncryptionService;
    private validator: ValidatorService;

    constructor(storage: StorageService, encryption: EncryptionService) {
        this.storage = storage;
        this.encryption = encryption;
        this.validator = new ValidatorService();
    }

    public async login(email: string, password: string): Promise<User | null> {
        if (!this.validator.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw new Error('User not found');
        }

        if (user.status === 'inactive' || user.status === 'suspended') {
            throw new Error('Account is disabled');
        }

        const hashedPassword = this.encryption.hashPassword(password);
        if (hashedPassword !== user.passwordHash) {
            throw new Error('Invalid password');
        }

        user.lastLogin = new Date().toISOString();
        this.saveUsers(users);

        return user;
    }

    public async register(email: string, password: string, name: string): Promise<User | null> {
        if (!this.validator.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }
        if (!this.validator.isValidPassword(password)) {
            throw new Error('Password must be at least 6 characters and include a number');
        }
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters');
        }

        const users = this.getUsers();

        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('Email already registered');
        }

        const newUser: User = {
            id: 'usr_' + Date.now(),
            email: email.toLowerCase(),
            passwordHash: this.encryption.hashPassword(password),
            name: name.trim(),
            role: 'user',
            status: 'active',
            apps: 0,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            emailVerified: false,
            preferences: {
                theme: 'dark',
                accentColor: '#c7794a',
                notifications: true,
                language: 'en'
            }
        };

        users.push(newUser);
        this.saveUsers(users);

        return newUser;
    }

    public async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            throw new Error('User not found');
        }

        const hashedOld = this.encryption.hashPassword(oldPassword);
        if (hashedOld !== user.passwordHash) {
            throw new Error('Current password is incorrect');
        }

        if (!this.validator.isValidPassword(newPassword)) {
            throw new Error('New password must be at least 6 characters and include a number');
        }

        user.passwordHash = this.encryption.hashPassword(newPassword);
        this.saveUsers(users);

        return true;
    }

    public async resetPassword(email: string): Promise<boolean> {
        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw new Error('User not found');
        }

        const resetToken = this.encryption.generateToken(32);
        // In production, store token with expiration and send via email.

        return true;
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
