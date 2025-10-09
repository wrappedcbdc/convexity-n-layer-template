import {Application} from "express";
import {systemCheck} from "../Common";
import {authRoute} from "../../Modules/User/route/auth.route";

export const registerRoutes = (app: Application) => {
    app.get('/health', systemCheck);
    app.use("/auth", authRoute);
}