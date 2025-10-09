import { Application } from 'express';
import { IErrorHandlingManager } from '../Interfaces/error-handling-manager.interface';
import { errorHandler } from '../../Middlewares/error.middleware';

export class ErrorHandlingManager implements IErrorHandlingManager {

    setupErrorHandling(app: Application): void {
        app.use(errorHandler);
    }
}