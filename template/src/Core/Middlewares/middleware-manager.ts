import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import {IMiddlewareManager} from "../Infrastructure/Interfaces/middleware-manager.interface";
import {Cors} from "./cors";
import {env} from "../Configs/env";

export class MiddlewareManager implements IMiddlewareManager {

    async setupMiddleware(app: Application): Promise<void> {

        app.use(express.json());
        app.use(cookieParser());
        app.use(express.urlencoded({ extended: true }));

        //If you have authentication middleware, initialize it here
        // await handler();

        app.use(Cors);

        app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

        app.use(helmet());

        app.set('trust proxy', 1);

        app.get('/favicon.ico', (_, res) => {
            res.status(200).end();
        });

    }
}