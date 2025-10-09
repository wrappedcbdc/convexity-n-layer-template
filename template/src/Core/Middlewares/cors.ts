import cors from "cors";
import { Request, Response, NextFunction } from "express";
import {env} from "../Configs/env";

/**
 * Specify allowlisted domains for staging and production environments.
 * Requests from these domains will be allowed by CORS.
 */

const whiteListForStaging = new Set([
    "http://staging.com",
]);

const whiteListForProduction = new Set([
    "https://production.com",
]);

const corsOptions = {
    origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin) {
            return callback(null, true);
        }
        const normalizedOrigin = origin.replace(/\/$/, '');
        let domains: Set<string>
        if (env.NODE_ENV === "production") {
            domains = whiteListForProduction;
        }
        else domains = whiteListForStaging;
        if (domains.has(normalizedOrigin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and authentication headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

export const Cors = (req: Request, res: Response, next: NextFunction) => {
    cors(corsOptions)(req, res, next);
};
