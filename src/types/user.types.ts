export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive' | 'suspended';
    apps: number;
    createdAt: string;
    lastLogin: string;
    emailVerified: boolean;
    preferences: UserPreferences;
}

export interface UserPreferences {
    theme: 'dark' | 'light';
    accentColor: string;
    notifications: boolean;
    language: string;
}

export interface UserSession {
    userId: string;
    email: string;
    role: 'user' | 'admin';
    token: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface UserRegistration {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}

export interface UserLogin {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface UserUpdate {
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
    status?: 'active' | 'inactive' | 'suspended';
    preferences?: Partial<UserPreferences>;
}
