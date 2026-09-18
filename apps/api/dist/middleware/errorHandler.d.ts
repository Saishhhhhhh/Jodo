import { Request, Response, NextFunction } from 'express';
interface ApiError extends Error {
    statusCode?: number;
    errors?: Record<string, string>;
}
/**
 * Global error handler middleware.
 * Must be registered LAST in Express app.
 */
export declare function errorHandler(err: ApiError, req: Request, res: Response, _next: NextFunction): void;
/**
 * 404 handler for unmatched routes.
 */
export declare function notFoundHandler(req: Request, res: Response): void;
export {};
