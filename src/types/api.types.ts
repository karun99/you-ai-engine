export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    code?: number;
}

export interface ApiRequest<T = any> {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    data?: T;
    headers?: Record<string, string>;
    params?: Record<string, any>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface ApiError {
    code: number;
    message: string;
    details?: any;
}
