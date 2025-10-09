import { Application } from 'express';

export interface IErrorHandlingManager {
    setupErrorHandling(app: Application): void;
}