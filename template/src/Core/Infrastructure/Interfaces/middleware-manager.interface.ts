import { Application } from 'express';

export interface IMiddlewareManager {
    setupMiddleware(app: Application): Promise<void>;
}