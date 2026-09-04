import { AdminStats, SystemSettings, ActivityLog } from '../types';
import { StorageService } from '../utils/storage';
import { UserManager } from '../core/UserManager';
import { ProjectManager } from '../core/ProjectManager';
import { ActivityLogger } from '../utils/activity-logger';

export class AdminManager {
    private storage: StorageService;
    private userManager: UserManager;
    private projectManager: ProjectManager;
    private logger: ActivityLogger;

    constructor(storage: StorageService, userManager: UserManager, projectManager: ProjectManager, logger: ActivityLogger) {
        this.storage = storage;
        this.userManager = userManager;
        this.projectManager = projectManager;
        this.logger = logger;
    }

    public async getDashboardStats(): Promise<AdminStats> {
        const users = await this.userManager.getAllUsers();
        const projects = await this.projectManager.getAllProjects();
        const logs = this.logger.getLogs(100);

        const stats: AdminStats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            totalProjects: projects.length,
            projectsToday: projects.filter(p => p.createdAt.startsWith(new Date().toISOString().split('T')[0])).length,
            storageUsed: this.storage.getSize().toLocaleString() + ' bytes',
            apiCalls: Math.floor(Math.random() * 10000), // Mocked
            activeSessions: 0, // Would come from SessionManager
            usersByRole: {
                user: users.filter(u => u.role === 'user').length,
                admin: users.filter(u => u.role === 'admin').length,
            },
            projectsByType: {
                text: projects.filter(p => p.outputFormat === 'text').length,
                audio: projects.filter(p => p.outputFormat === 'audio').length,
                ppt: projects.filter(p => p.outputFormat === 'ppt').length,
                pdf: projects.filter(p => p.outputFormat === 'pdf').length,
                markdown: projects.filter(p => p.outputFormat === 'markdown').length,
                custom: projects.filter(p => p.outputFormat === 'custom').length,
            },
            recentActivities: logs,
        };

        return stats;
    }

    public async getSystemSettings(): Promise<SystemSettings> {
        const settings = this.storage.get('system_settings');
        if (settings) return JSON.parse(settings);

        const defaultSettings: SystemSettings = {
            appName: 'Perspective AI',
            appVersion: '1.0.0',
            maxAppsPerUser: 5,
            encryptionEnabled: true,
            botProofEnabled: true,
            galleryEnabled: true,
            registrationEnabled: true,
            maintenanceMode: false,
        };

        this.saveSettings(defaultSettings);
        return defaultSettings;
    }

    public async updateSystemSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
        const current = await this.getSystemSettings();
        const updated = { ...current, ...updates };
        this.saveSettings(updated);
        return updated;
    }

    private saveSettings(settings: SystemSettings): void {
        this.storage.set('system_settings', JSON.stringify(settings));
    }
}
