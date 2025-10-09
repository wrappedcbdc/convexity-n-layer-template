import {ZodError, ZodIssue} from "zod";
import {NextFunction, Response, Request, RequestHandler} from "express";
import {CacheFacade} from "./facade/cache";

const formatZodIssue = (issue: ZodIssue): string => {
    const { path, message } = issue
    const pathString = path.join('.')

    return `${pathString}: ${message}`
}

export const formatZodError = (error: ZodError) => {
    const { issues } = error

    if (issues.length) {
        const currentIssue = issues[0]

        return formatZodIssue(currentIssue)
    }

    return 'Invalid data'
}

export const systemCheck: RequestHandler = async (_: Request, res: Response, _next: NextFunction) => {
    const health = {
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date.now(),
        redis: "disconnected" as "connected" | "disconnected",
    };

    try {
        // Redis check
        try {
            const redisStatus = await CacheFacade.redisCache.ping();
            if (redisStatus === "PONG") {
                health.redis = "connected";
            }
        } catch {
            health.redis = "disconnected";
        }

        const isHealthy = health.redis === "connected";
        health.message = isHealthy ? "Service is healthy" : "Service is unhealthy";

        if (!isHealthy) {
            return res.status(500).json({
                message: "Request cannot be processed. Please try again later.",
                status: false,
                report: health
            });
        }

        return _next()
    }
    catch {
        health.message = "Service error";
        return res.status(500).json({
            status: false,
            report: health
        });
    }
}