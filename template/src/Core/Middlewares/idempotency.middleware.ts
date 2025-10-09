import { NextFunction, Response, Request, RequestHandler } from "express";

interface CacheEntry {
    timestamp: number;
    count: number;
}

export function IdempotencyAuth(timeWindow: number = 10000, maxRequests: number = 10): RequestHandler {
    const cache: Map<string, CacheEntry> = new Map();

    function cleanupCache() {
        const now = Date.now();
        for (const [key, entry] of cache.entries()) {
            if (now - entry.timestamp > timeWindow) {
                cache.delete(key);
            }
        }
    }

    function generateKey(req: Request): string {
        return `${req.method}-${req.url}-${req.ip}`;
    }

    setInterval(cleanupCache, timeWindow * 2);

    return function middleware(req: Request, res: Response, next: NextFunction): void {
        const key = generateKey(req);
        const now = Date.now();
        if (cache.has(key)) {
            const entry = cache.get(key)!;

            if (now - entry.timestamp < timeWindow) {
                if (entry.count >= maxRequests) {
                    res.status(429).json({
                        message: 'Too Many Requests',
                        retryAfter: Math.ceil((entry.timestamp + timeWindow - now) / 1000)
                    });
                    return;
                }
                entry.count++;
            }
            else {
                entry.timestamp = now;
                entry.count = 1;
            }
        }
        else {
            cache.set(key, { timestamp: now, count: 1 });
        }

        next();
    };
}
