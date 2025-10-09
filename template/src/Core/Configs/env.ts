import { cleanEnv, str, num  } from 'envalid';
import { config } from 'dotenv';

config();

export const env = cleanEnv(process.env, {
    PORT: num(),
    NODE_ENV: str(),
    ENCRYPTION_KEY: str(),
    REDIS_URL: str(),
    SENTRY_DSN: str(),
});
