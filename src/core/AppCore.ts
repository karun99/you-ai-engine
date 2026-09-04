import { StorageService } from '../utils/storage';
import { EncryptionService } from '../utils/encryption';
import { AuthManager } from './AuthManager';
import { UserManager } from './UserManager';
import { ProjectManager } from './ProjectManager';
import { SessionManager } from './SessionManager';
import { AdminManager } from './AdminManager';
import { AIEngine } from './AIEngine';
import { ActivityLogger } from '../utils/activity-logger';

export class AppCore {
    public static instance: AppCore;
    
    public readonly storage: StorageService;
    public readonly encryption: EncryptionService;
    public readonly auth: AuthManager;
    public readonly users: UserManager;
    public readonly projects: ProjectManager;
    public readonly sessions: SessionManager;
    public readonly admin: AdminManager;
    public readonly ai: AIEngine;
    public readonly logger: ActivityLogger;

    private constructor() {
        this.storage = StorageService.getInstance();
        this.encryption = EncryptionService.getInstance();
        this.logger = new ActivityLogger(this.storage);
        
        this.auth = new AuthManager(this.storage, this.encryption);
        this.users = new UserManager(this.storage, this.encryption);
        this.projects = new ProjectManager(this.storage);
        this.sessions = new SessionManager(this.storage, this.encryption);
        this.admin = new AdminManager(this.storage, this.users, this.projects, this.logger);
        this.ai = new AIEngine();
    }

    public static getInstance(): AppCore {
        if (!AppCore.instance) {
            AppCore.instance = new AppCore();
        }
        return AppCore.instance;
    }

    /**
     * Helper to log activities easily through the core
     */
    public async logActivity(userId: string, userName: string, action: string, details: any): Promise<void> {
        await this.logger.log(userId, userName, action, details);
    }
}
