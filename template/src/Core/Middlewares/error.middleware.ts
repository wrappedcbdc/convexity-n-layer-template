import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from "../Response/response.handler";
import {env} from "../Configs/env";
import {AppError} from "../Errors/app.errors";

/**
 * Global error handling middleware for Express
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {

    // If it's our AppError, we can extract the details
    if (err instanceof AppError) {
        return ResponseHandler.sendError(
            res,
            err.statusCode,
            err.message,
        );
    }

    // Handle validation errors (e.g., from Zod, Joi, etc.)
    if (err.name === 'ValidationError' || err.name === 'ZodError') {
        return ResponseHandler.sendError(
            res,
            422,
            'Validation failed',
        );
    }

    // Handle MongoDB duplicate key error
    if ((err as any).code === 11000) {
        return ResponseHandler.sendError(
            res,
            409,
            'Duplicate field value',
        );
    }

    // Handle JSON parse errors
    if ('body' in (err as any)) {
        return ResponseHandler.sendError(
            res,
            400,
            'Invalid JSON',
        );
    }

    // For unknown errors, return a generic error response
    return ResponseHandler.sendError(
        res,
        500,
        env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message,
    );
};