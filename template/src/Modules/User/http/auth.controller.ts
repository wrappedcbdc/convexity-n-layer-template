import UsersService from "../services/users.service";
import { Request, Response } from "express";
import {ResponseHandler} from "../../../Core/Response/response.handler";

const userService = UsersService;

export class AuthController {

    public static async register(req: Request, res: Response) {
        userService.RegisterNewUser(req.body).then((payload) => {
            return ResponseHandler.sendSuccess(
                res,
                201,
                "User registered successfully",
                payload
            );
        }).
        catch((error) => {
            return ResponseHandler.sendError(
                res,
                400,
                error?.message || "Error registering user",
            );
        })
    }


}