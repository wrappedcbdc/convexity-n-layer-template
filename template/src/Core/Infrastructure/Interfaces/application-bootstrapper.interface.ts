import { Application } from 'express';

export interface IApplicationBootstrapper {
    bootstrap(app: Application): Promise<void>;
}