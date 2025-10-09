import {Redis} from 'ioredis';
import {env} from "./Configs/env";

class RedisCache {
    private static instance: Redis | null = null;
    private static isInitialized = false;

    private constructor() {}

    public static getInstance(): Redis {
        if (!RedisCache.instance) {
            const redisUrl = env.REDIS_URL!;
            if (!redisUrl) {
                throw new Error('Redis connection URL is not defined in environment variables');
            }

            RedisCache.instance = new Redis(redisUrl, {
                retryStrategy: (times: number) => Math.min(times * 50, 2000),
                maxRetriesPerRequest: null,
                enableReadyCheck: true,
            });

            RedisCache.instance.on('error', (error: Error) => {
                console.error('Redis connection error:', error);
            });

            RedisCache.instance.on('connect', () => {
                RedisCache.isInitialized = true;
            });
        }

        return RedisCache.instance;
    }

    public static async closeConnection(): Promise<void> {
        if (RedisCache.instance) {
            await RedisCache.instance.quit();
            RedisCache.instance = null;
            RedisCache.isInitialized = false;
        }
    }

    public static isConnected(): boolean {
        return RedisCache.isInitialized && RedisCache.instance !== null;
    }
}


export default RedisCache;
