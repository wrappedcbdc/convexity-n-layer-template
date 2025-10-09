import { Application } from 'express';
import { Server } from 'http';
import { IServerManager } from '../Interfaces/server-manager.interface';
import {env} from "../../Configs/env";

export class ServerManager implements IServerManager {
    private server: Server | null = null;
    private readonly port: number;

    constructor(private app: Application) {
        this.port = env.PORT || 8080;
    }

    async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.port, () => {
                    console.log(`Server started on localhost:${this.port}`);
                    resolve();
                });

                this.server.on('error', (error) => {
                    console.error('Server error:', error);
                    reject(error);
                });
            }
            catch (error) {
                console.error("Failed to start server:", error);
                reject(error);
            }
        });
    }

    async stop(): Promise<void> {
        if (this.server) {
            return new Promise((resolve) => {
                this.server!.close(() => {
                    console.log('Server stopped');
                    this.server = null;
                    resolve();
                });
            });
        }
    }

    isRunning(): boolean {
        return this.server !== null;
    }
}