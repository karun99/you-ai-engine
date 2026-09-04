export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    projectsToday: number;
    storageUsed: string;
    apiCalls: number;
    activeSessions: number;
    usersByRole: {
        user: number;
        admin: number;
    };
    projectsByType: {
        text: number;
        audio: number;
        ppt: number;
        pdf: number;
        markdown: number;
        custom: number;
    };
    recentActivities: ActivityLog[];
}

export interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    details: any;
    timestamp: string;
    ipAddress?: string;
}

export interface AdminDashboardData {
    stats: AdminStats;
    users: any[]; // Will be User[] once imported
    projects: any[]; // Will be Project[] once imported
    logs: ActivityLog[];
    galleryItems: any[]; // Will be Project[] once imported
}

export interface SystemSettings {
    appName: string;
    appVersion: string;
    maxAppsPerUser: number;
    encryptionEnabled: boolean;
    botProofEnabled: boolean;
    galleryEnabled: boolean;
    registrationEnabled: boolean;
    maintenanceMode: boolean;
}
