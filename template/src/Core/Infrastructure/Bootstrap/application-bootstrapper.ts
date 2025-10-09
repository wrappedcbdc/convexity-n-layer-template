import { Application } from 'express';
import { IContainer } from '../Interfaces/container.interface';
import { IMiddlewareManager } from '../Interfaces/middleware-manager.interface';
import { IRoutingManager } from '../Interfaces/routing-manager.interface';
import { IErrorHandlingManager } from '../Interfaces/error-handling-manager.interface';
import {IApplicationBootstrapper} from "../Interfaces/application-bootstrapper.interface";
import { ServiceRegistrar } from '../service-registrar';

export class ApplicationBootstrapper implements IApplicationBootstrapper {

    constructor(private container: IContainer) {}

    async bootstrap(app: Application): Promise<void> {
        try {
            // Register all services
            await this.registerServices();

            // Setup middleware
            const middlewareManager = this.container.resolve<IMiddlewareManager>('MiddlewareManager');
            await middlewareManager.setupMiddleware(app);

            // Setup routing
            const routingManager = this.container.resolve<IRoutingManager>('RoutingManager');
            routingManager.setupRouting(app);

            // Setup error handling
            const errorHandlingManager = this.container.resolve<IErrorHandlingManager>('ErrorHandlingManager');
            errorHandlingManager.setupErrorHandling(app);

        }
        catch (error) {
            console.error("Failed to bootstrap application:", error);
            throw error;
        }
    }

    private async registerServices(): Promise<void> {
        // Register all services in the container
        const serviceRegistrar = new ServiceRegistrar(this.container);
        await serviceRegistrar.registerAll();
    }
}