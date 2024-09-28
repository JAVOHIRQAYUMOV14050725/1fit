import { UserController } from "@controllers";
import { verifyToken } from "@middlewares";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/getMe",verifyToken, UserController.getMyself);

export { userRouter };
