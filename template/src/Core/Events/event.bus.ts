import { EventEmitter } from 'events';
import { EventType, EventPayloads } from './event.types';

export class cNGNEventBus {

    private emitter = new EventEmitter();
    private subscriptions = new Map<EventType, Function[]>();

    async publish<T extends EventType>(type: T, payload: EventPayloads[T]): Promise<void> {
        this.emitter.emit(type, payload);
    }

    async subscribe<T extends EventType>(type: EventType.SEND_WELCOME_MAIL, handler: (payload: EventPayloads[T]) => Promise<void>, serviceName: string): Promise<void> {
        const wrappedHandler = async (payload: EventPayloads[T]) => {
            try { await handler(payload) }
            catch (error: any) {
                console.error(`Error in service ${serviceName} handling event ${type}:`, error);
                // Here you could implement retry logic or logging to a dead-letter queue
            }
        };

        this.emitter.on(type, wrappedHandler);
        this.subscriptions.set(type, [
            ...(this.subscriptions.get(type) || []),
            wrappedHandler,
        ]);
    }
}

export const eventBus = new cNGNEventBus();