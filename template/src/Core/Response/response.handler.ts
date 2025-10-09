import {Response} from 'express';

export interface ApiResponse<T = any> {
    status: boolean;
    message?: string;
    data?: T;
}

export class ResponseHandler {

    static success<T>(data?: T, message?: string): ApiResponse<T> | T {
        return {
            status: true,
            message,
            data: data as T
        };
    }


    static sendSuccess<T>(res: Response, statusCode: number, message?: string, data?: T): void {
        res.status(statusCode).json(this.success(data, message));
    }

    static error(message: string): ApiResponse {
        return {
            status: false,
            message
        }
    }

    static sendError(res: Response, statusCode: number, message: string): void {
        res.status(statusCode).json(this.error(message));
    }
}
