import { Response } from 'express';
export declare function sendSuccess<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
export declare function sendCreated<T>(res: Response, data: T, message?: string): Response;
export declare function sendError(res: Response, message: string, statusCode?: number, errors?: Record<string, string>): Response;
export declare function sendUnauthorized(res: Response, message?: string): Response;
export declare function sendForbidden(res: Response, message?: string): Response;
export declare function sendNotFound(res: Response, resource?: string): Response;
export declare function sendPaginated<T>(res: Response, data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
}): Response;
