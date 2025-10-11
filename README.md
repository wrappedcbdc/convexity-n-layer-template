
Tests live next to code or under `tests/` following the same structure:
- Unit: domain and application (fast, isolated).
- Integration: infra adapters, HTTP endpoints.
- E2E: black‑box flows.

## Layer responsibilities

- API
    - Schemas/validation (zod)
    - Controllers: translate HTTP to use case inputs
    - Middlewares: helmet, cors, rate limiting, request logging, error handling

- Application
    - Use cases (commands/queries)
    - Transaction boundaries
    - Ports (interfaces) for persistence/cache/external services
    - Mapping to/from DTOs

- Domain
    - Entities/value objects and invariants
    - Domain services and events
    - No framework or IO dependencies

- Infrastructure
    - Implement ports (repositories, caches, external clients)
    - Logging (winston, express‑winston), metrics, Sentry
    - Database client and migrations
    - Caching (ioredis), rate limit stores

- Config/Bootstrap
    - Environment validation (envalid)
    - Dependency wiring (compose concrete adapters for ports)
    - Process signals and graceful shutdown

## Dependency rules

- API can depend on Application and Shared.
- Application can depend on Domain and Shared.
- Domain depends only on Shared (or nothing).
- Infrastructure depends on Application/Domain ports and Shared, but application/domain must not import infra.
- Wiring happens in `config/` and `server.ts` only.

## Request lifecycle

1. Request hits Express route.
2. Validator parses input (zod). On failure → 400.
3. Controller constructs a use‑case input DTO and calls Application.
4. Use case coordinates domain logic and calls port(s).
5. Infra adapters fulfill port requests (DB, cache, HTTP).
6. Result mapped to HTTP response.
7. Errors are converted to HTTP using centralized error middleware (http-errors).
8. Access logs and error logs are emitted (winston/express‑winston/Sentry).

## Getting started

- Requirements: Node.js >= 18, npm
- Install dependencies:
  ```bash
  npm install
  ```
- Development:
  ```bash
  npm run dev
  ```
- Build:
  ```bash
  npm run build
  ```
- Run:
  ```bash
  npm start
  ```
- Test:
  ```bash
  npm test
  ```
- Generate Module:
    ```bash
    npm run generate:module <ModuleName>
    ```

## Environment variables

Define in `.env` and validate in `config/` using envalid.

- NODE_ENV=development|test|production
- PORT=3000
- LOG_LEVEL=info|debug|warn|error
- DATABASE_URL=<YOUR_DATABASE_URL>
- REDIS_URL=redis://<HOST>:<PORT>/<DB>
- CORS_ORIGIN=<YOUR_FRONTEND_ORIGIN>
- RATE_LIMIT_WINDOW_MS=60000
- RATE_LIMIT_MAX=100
- SENTRY_DSN=<YOUR_SENTRY_DSN>

Provide an `.env.example` with placeholders.

## Logging and observability

- Request logging via morgan or express‑winston.
- Structured logs via winston with daily rotate (if configured).
- Errors reported to Sentry in production.
- Correlate logs with request IDs (middleware) when available.

## Validation and errors

- Input validation with zod validators in API layer.
- Throw domain/application errors for business rules.
- Translate to HTTP using a centralized error handler (http-errors).
- Never leak internal error details in production responses.

## Security

- helmet and cors in API layer.
- Rate limiting (express-rate-limit) with Redis store in production.
- Sanitize and validate all inputs.
- Keep secrets in environment variables only.

## Caching

- ioredis client initialized in infra/redis.
- Application layer depends on a CachePort; infra provides RedisCacheAdapter.
- Use short TTLs for request‑scoped caching where appropriate.

## Background jobs

- Use cron for scheduled tasks in `jobs/`.
- Jobs resolve application use cases; avoid calling infra directly.
- Ensure graceful shutdown and health of job workers.

## Adding a new feature (checklist)

1. Domain
    - Add entity/value object and any domain errors.
2. Application
    - Define a port if external persistence/integration is needed.
    - Implement a use case (command/query) that uses the port(s).
3. Infrastructure
    - Implement the port(s) (e.g., RepositoryAdapter).
    - Add migrations or schema changes if needed.
4. API
    - Add validator schema.
    - Add controller and route; map to the use case.
5. Wire it
    - Register adapter implementations and bind them in the composition root.
6. Tests
    - Unit test domain and use cases.
    - Integration test adapters and HTTP route.

## Scripts

Common scripts you can expect:
- dev: run the app in watch mode
- build: compile TypeScript to dist
- start: run compiled app
- test: run unit/integration tests
- lint: static analysis

## Contributing

- Follow the layer boundaries and dependency rules.
- Prefer small, focused PRs with tests.
- Use conventional commit messages where possible.

---

If you need help locating where a piece of logic should live, start from the API boundary and walk inward following the dependency rules above.