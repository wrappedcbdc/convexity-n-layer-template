import { IContainer } from '../Interfaces/container.interface';

export class Container implements IContainer {

    private services = new Map<string, any>();
    private singletons = new Map<string, any>();
    private factories = new Map<string, () => any>();

    register<T>(token: string, factory: () => T): void {
        this.factories.set(token, factory);
    }

    registerSingleton<T>(token: string, factory: () => T): void {
        this.factories.set(token, factory);
        this.services.set(token, null); // Mark as singleton
    }

    resolve<T>(token: string): T {
        if (this.singletons.has(token)) {
            return this.singletons.get(token);
        }

        if (this.services.has(token)) {
            // It's a singleton that hasn't been created yet
            const instance = this.factories.get(token)!();
            this.singletons.set(token, instance);
            return instance;
        }

        if (this.factories.has(token)) {
            return this.factories.get(token)!();
        }

        throw new Error(`Service ${token} not found`);
    }

    has(token: string): boolean {
        return this.factories.has(token) || this.singletons.has(token);
    }
}