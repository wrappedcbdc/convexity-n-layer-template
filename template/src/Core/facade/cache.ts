import {Redis} from "ioredis";
import redis from "../Redis";

export class CacheFacade {

    private static _redisCache: Redis;

    public static get redisCache(): Redis {
        if (!this._redisCache) {
            this._redisCache = redis.getInstance();
        }
        return this._redisCache;
    }
}
