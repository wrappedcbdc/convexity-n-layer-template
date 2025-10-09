import { Request, Response, NextFunction, RequestHandler } from "express";

export const use = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | void): RequestHandler =>
(req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(
        (err) => {
            next(err);
        }
    );
};
