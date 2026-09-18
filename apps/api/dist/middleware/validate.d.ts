import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Zod validation middleware factory.
 * Validates req.body against a Zod schema.
 */
export declare function validate(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Zod validation middleware for query params.
 */
export declare function validateQuery(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
