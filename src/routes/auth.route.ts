import { AuthController } from "@controllers";
import {  Router } from "express";
import passport from "passport";




let authRouter = Router()

authRouter.get("/github/login",AuthController.AuthenticationGithub)

authRouter.get("/github/callback",passport.authenticate("github"),AuthController.CallbackGithub)

authRouter.post("/refresh_token",AuthController.refreshAccessToken)
authRouter.post("/new_refresh_token",AuthController.newRefreshAccessToken)




export { authRouter}