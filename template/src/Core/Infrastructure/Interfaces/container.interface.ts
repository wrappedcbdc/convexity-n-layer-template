export interface IContainer {
    register<T>(token: string, factory: () => T): void;
    registerSingleton<T>(token: string, factory: () => T): void;
    resolve<T>(token: string): T;
    has(token: string): boolean;
}