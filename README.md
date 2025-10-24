# Convexity Express Service Framework

A lightweight TypeScript framework for building HTTP services with Express 5, modular lifecycle management, dependency injection, and Redis-backed caching. It emphasizes clean separation of concerns, environment-driven configuration, and graceful startup/shutdown.

## Overview

- **Language**: TypeScript (Node.js)
- **HTTP**: Express 5
- **Config**: dotenv + runtime validation (via envalid/zod)
- **DI**: Minimal, composable container for factories and singletons
- **Caching/IPC**: Redis (ioredis)
- **Eventing**: In-process async event bus (publish/subscribe)
- **Security**: helmet, cors, rate limiting
- **Logging**: winston (+ express-winston), morgan, optional daily rotate
- **Monitoring**: optional Sentry
- **Jobs**: cron
- **Testing**: jest, ts-jest, sinon

## Architectural Design

### Bootstrapper
- Loads environment variables.
- Obtains the application singleton and starts it.
- Registers OS signal handlers (SIGINT/SIGTERM) for graceful shutdown.

### Core Application (App)
- Encapsulates service lifecycle: initialize → start HTTP server → stop/cleanup.
- Wires middlewares, routes, error handling, logging, and integrations.
- Exposed as a singleton to guarantee a single running instance.

### Dependency Injection Container
- Factory and singleton registration.
- Lazy resolution for services.
- Enables modular features and testability without global state leakage.

### Configuration Layer
- Centralized environment parsing and validation.
- Provides typed access to settings like PORT and REDIS_URL.

### Redis Cache
- Singleton Redis client with retry strategy and connection state.
- Safe initialization and teardown for graceful shutdown.

### Event Bus
- In-process, asynchronous publish/subscribe mechanism for domain events.
- Decouples producers (publishers) from consumers (subscribers).
- Handlers are wrapped with error isolation so one failing subscriber does not crash the process.
- Suitable for intra-process workflows, UI-less side effects (emails, notifications), and cross-module coordination.

### Cross-cutting Concerns
- **Security**: helmet, cors, rate limits.
- **Observability**: winston logs, morgan HTTP logs, optional Sentry.
- **Validation**: zod for request/DTO validation.
- **Errors**: consistent http-errors mapping and centralized error middleware.
- **Jobs**: cron-based scheduled tasks sharing the DI and config.

## Process Flow

### 1. Startup
- Read `.env` and validate config.
- Create/get App singleton.
- Initialize DI container and register services.
- Build Express app:
    - Security (helmet, cors), request logging (morgan), body parsing, cookies.
    - Rate limiting and any custom middlewares.
    - Routes/controllers with schema validation.
    - Error-handling middleware.
- Start listening on configured PORT.
- Redis is lazily connected on first use, then reused.

### 2. Runtime
- Requests flow through middleware → controllers/services → responses.
- Services are resolved via DI container (singletons/factories).
- Domain events are published to the event bus and delivered asynchronously to subscribed handlers.
- Logs emitted through winston; HTTP logs via morgan.
- Scheduled jobs run via cron and can use the same services/Redis.

### 3. Shutdown (SIGINT/SIGTERM)
- Stop accepting new connections and drain in-flight requests.
- Close external resources (e.g., Redis).
- Flush logs and exit cleanly.

## Key Features

### Simple DI Container
- `register(token, factory)` for transient services.
- `registerSingleton(token, factory)` for single-instance services.
- `resolve(token)` for retrieval with lazy instantiation.

### Clean App Lifecycle
- Graceful shutdown hooks.

### Redis Client Singleton
- Retry strategy.
- Connection status checks.
- Explicit close method for teardown.

### Event Bus
- In-process async pub/sub API (publish, subscribe).
- Error isolation per handler, with room for retries/dead-letter patterns.
- Subscription tracking for observability.

### Express 5 Stack
- Security, CORS, logging, and centralized error handling.

### Additional Features
- Validated configuration and typed access to env variables.
- Pluggable jobs and third-party integrations (Sentry, etc.).
- Testing-ready structure with Jest + Sinon.

## Configuration

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000
REDIS_URL=redis://:<REDIS_PASSWORD>@<REDIS_HOST>:<REDIS_PORT>/<DB_INDEX>
LOG_LEVEL=info
SENTRY_DSN=<YOUR_SENTRY_DSN_OR_EMPTY>
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

Use the provided config layer to access parsed/validated env values.

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run in Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start Production Build
```bash
npm start
```

### Test
```bash
npm test
```

### Generate a New Module
```bash
npm run generate:module <module-name>
```
This creates a new module scaffold under `src/Modules/<module-name>`.

## Event Bus

The event bus provides a lightweight, in-memory publish/subscribe mechanism to decouple modules. Publishers emit typed events with payloads; subscribers register async handlers for specific event types.

### When to Use
- Trigger side effects after core actions (e.g., send email after user signup).
- Decouple modules to reduce direct dependencies.
- Coordinate workflows within the same Node.js process.

### Semantics
- In-process only (not distributed by default).
- At-most-once delivery per running process.
- Handlers are invoked asynchronously; failures are isolated and logged.
- Subscriptions persist for the process lifetime.

### Usage

#### 1. Define Event Types and Payload Map

```typescript
// events.ts
export enum EventType {
  USER_REGISTERED = 'USER_REGISTERED',
  ORDER_PAID = 'ORDER_PAID',
}

export interface EventPayloads {
  [EventType.USER_REGISTERED]: { userId: string; email: string };
  [EventType.ORDER_PAID]: { orderId: string; amount: number };
}
```

#### 2. Subscribe to an Event

```typescript
// user-notifications.module.ts
import { EventType } from './events';

type UserRegistered = { userId: string; email: string };

async function onUserRegistered(payload: UserRegistered): Promise<void> {
  // e.g., send a welcome email
  // await emailService.sendWelcome(payload.email);
  console.log('Welcome email queued for', payload.email);
}

export async function initUserNotifications() {
  await eventBus.subscribe(
    EventType.USER_REGISTERED,
    onUserRegistered,
    'UserNotifications'
  );
}
```

#### 3. Publish an Event

```typescript
// user.service.ts
import { EventType } from './events';

export async function registerUser(input: { email: string; password: string }) {
  // 1) core logic: create user
  const userId = '...'; // result of creation

  // 2) publish domain event
  await eventBus.publish(EventType.USER_REGISTERED, {
    userId,
    email: input.email,
  });

  return { userId };
}
```

### Error Handling and Reliability

- Handler failures are caught and logged; one failing subscriber will not affect others.
- For critical workflows, consider:
    - Idempotent handlers (safe to re-run).
    - Adding retry/backoff around failing handlers.
    - Forwarding irrecoverable payloads to a dead-letter queue (e.g., Redis list, external broker).
- If you need cross-process or guaranteed delivery semantics, integrate a persistent broker (e.g., Redis streams, RabbitMQ, Kafka) behind the same EventBus interface.

### Testing

- In unit tests, replace the EventBus with a test double injected via DI.
- Assert that `publish()` was called with the correct type/payload, or invoke handlers directly for behavior tests.

## Usage Examples

### Resolving Services from the DI Container

```typescript
import { Container } from '<your-path>/Core/Container/container';

const container = new Container();

// Register a transient service
container.register('EmailService', () => new EmailService(/* deps */));

// Register a singleton
container.registerSingleton('Config', () => new ConfigService(/* env */));

// Resolve where needed
const emailService = container.resolve<EmailService>('EmailService');
```

### Using the Redis Cache Singleton

```typescript
import RedisCache from '<your-path>/Infra/Redis';

async function cacheExample() {
  const redis = RedisCache.getInstance();
  await redis.set('foo', 'bar');
  const val = await redis.get('foo'); // "bar"
}
```

### Graceful Shutdown

```typescript
// On application stop, ensure external resources are closed
await RedisCache.closeConnection();
// Close HTTP server and other resources here
```

## Testing

- Unit tests with Jest + ts-jest (TypeScript).
- Use Sinon for spies/stubs/mocks.
- Prefer DI to mock dependencies instead of touching global state.

## Operational Notes

- The in-process event bus is not a message queue; for multi-instance deployments, pair it with a persistent broker for cross-process delivery.
- Health/readiness endpoints are commonly added to support orchestration; consider exposing endpoints for liveness/readiness if you deploy in containers.
- Ensure Redis and other external dependencies are optional where appropriate to enable local development without external services.
- Always verify graceful shutdown in your target environment (containers, Kubernetes, systemd).
