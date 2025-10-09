import {IMiddlewareManager} from "./Interfaces/middleware-manager.interface";
import {IContainer} from "./Interfaces/container.interface";
import {RoutingManager} from "./Routing/routing-manager";
import {ErrorHandlingManager} from "./ErrorHandling/error-handling-manager";
import { MiddlewareManager } from "../Middlewares/middleware-manager";
import {IRoutingManager} from "./Interfaces/routing-manager.interface";
import {IErrorHandlingManager} from "./Interfaces/error-handling-manager.interface";


export class ServiceRegistrar {

    constructor(private container: IContainer) {}

    async registerAll(): Promise<void> {
        this.registerInfrastructureServices();
        this.registerDomainServices();
        await this.initializeServices();
    }

    private registerInfrastructureServices(): void {
        this.container.registerSingleton<IMiddlewareManager>(
            'MiddlewareManager',
            () => new MiddlewareManager()
        );

        this.container.registerSingleton<IRoutingManager>(
            'RoutingManager',
            () => new RoutingManager()
        );

        this.container.registerSingleton<IErrorHandlingManager>(
            'ErrorHandlingManager',
            () => new ErrorHandlingManager()
        );
    }

    private registerDomainServices(): void {
       // Register domain-specific services here
        /*this.container.registerSingleton<EmailService>(
            'EmailService',
            () => new EmailService()
        );*/
    }

    private async initializeServices(): Promise<void> {
        // Initialize services that need initialization
        // this.container.resolve<EmailService>('EmailService');
    }
}