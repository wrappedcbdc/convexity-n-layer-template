import { Application } from 'express';
import { IRoutingManager } from '../Interfaces/routing-manager.interface';
import {registerRoutes} from "../../Routes/register.routes";

export class RoutingManager implements IRoutingManager {

    setupRouting(app: Application): void {
        registerRoutes(app);
    }
}