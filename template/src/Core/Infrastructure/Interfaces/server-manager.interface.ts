export interface IServerManager {
    start(): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
}