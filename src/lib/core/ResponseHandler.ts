/*
    Interfaz y Clase que maneja la respuesta
*/

export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    timestamp: string;
    count?: number;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export class ResponseHandler {
    static success(data: any): ApiResponse {
        return {
            status: 'success',
            timestamp: new Date().toISOString(),
            count: Array.isArray(data) ? data.length : 1,
            data: data
        };
    }

    static error(message: string, details: any = null, code: string = 'INTERNAL_ERROR'): ApiResponse {
        return {
            status: 'error',
            timestamp: new Date().toISOString(),
            error: {
                code,
                message,
                details
            }
        };
    }
}