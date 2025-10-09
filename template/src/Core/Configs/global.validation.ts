import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import {ResponseHandler} from "../Response/response.handler";
import {formatZodError} from "../Common";


export const validateSchema = (schema: ZodSchema<any>, overrideRequestBody?: boolean) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return ResponseHandler.sendError(res, 400, formatZodError(parsed.error));
        }
        // Optionally override the request body with the parsed result:
        if (overrideRequestBody) {
            req.body = parsed.data;
        }

        return next();
    };
};
