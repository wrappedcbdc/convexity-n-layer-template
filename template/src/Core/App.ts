import express, {Application} from "express";
import { IServerManager } from './Infrastructure/Interfaces/server-manager.interface';
import { IContainer } from './Infrastructure/Interfaces/container.interface';
import { Container } from './Infrastructure/Container/container';
import { ServerManager } from './Infrastructure/Server/server-manager';
import { ApplicationBootstrapper } from './Infrastructure/Bootstrap/application-bootstrapper';
import {IApplicationBootstrapper} from "./Infrastructure/Interfaces/application-bootstrapper.interface";
import * as Sentry from "@sentry/node";
import {env} from "./Configs/env";

export class App {
    private static instance: App;
    private readonly container: IContainer;
    private bootstrapper: IApplicationBootstrapper;
    private serverManager: IServerManager;
    private readonly app: Application;

    private constructor() {
        App.setupSentry();
        this.app = express();
        this.container = new Container();
        this.bootstrapper = new ApplicationBootstrapper(this.container);
        this.serverManager = new ServerManager(this.app);
    }

    public static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    private static setupSentry() {
        Sentry.init({
            dsn: env.SENTRY_DSN!,
            tracesSampleRate: 1.0,
            enableLogs: true
        });
    }

    public async start(): Promise<void> {
        try {
            await this.bootstrapper.bootstrap(this.app);
            await this.serverManager.start();
        }
        catch (error) {
            console.error("Failed to start the application:", error);
            throw error;
        }
    }

    public async stop(): Promise<void> {
        await this.serverManager.stop();
    }

    public getApp(): Application {
        return this.app;
    }
}