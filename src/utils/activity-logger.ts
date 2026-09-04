import { ActivityLog } from '../types';
import { StorageService } from '../utils/storage';

export class ActivityLogger {
    private storage: StorageService;

    constructor(storage: StorageService) {
        this.storage = storage;
    }

    public async log(userId: string, userName: string, action: string, details: any, ipAddress?: string): Promise<void> {
        const logs = this.getLogs();
        const newLog: ActivityLog = {
            id: 'log_' + Date.now(),
            userId,
            userName,
            action,
            details,
            timestamp: new Date().toISOString(),
            ipAddress
        };

        logs.unshift(newLog);
        // Keep only last 1000 logs
        const limitedLogs = logs.slice(0, 1000);
        this.saveLogs(limitedLogs);
    }

    public getLogs(limit: number = 100): ActivityLog[] {
        const logs = this.getLogsAll();
        return logs.slice(0, limit);
    }

    private getLogsAll(): ActivityLog[] {
        const data = this.storage.get('activity_logs');
        if (data) {
            try {
                return JSON.parse(data);
            } catch {
                return [];
            }
        }
        return [];
    }

    private saveLogs(logs: ActivityLog[]): void {
        this.storage.set('activity_logs', JSON.stringify(logs));
    }
}
