
/**
 * Standard application error class that works with both REST and tRPC
 */
export class AppError extends Error {

    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: any;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = isOperational;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);

        // Set prototype explicitly
        Object.setPrototypeOf(this, AppError.prototype);
    }
}