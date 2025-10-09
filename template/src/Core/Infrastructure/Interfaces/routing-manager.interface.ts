import { Application } from 'express';

export interface IRoutingManager {
    setupRouting(app: Application): void;
}