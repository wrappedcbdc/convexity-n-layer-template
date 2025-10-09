import {Router} from "express";
import {use} from "../../../Core/Middlewares/use.middleware";
import {validateSchema} from "../../../Core/Configs/global.validation";
import {registerUserSchema} from "../validation/auth.rules";
import {AuthController} from "../http/auth.controller";

const router = Router();

router.post("/register", [validateSchema(registerUserSchema)], use(AuthController.register));

export const authRoute = router;