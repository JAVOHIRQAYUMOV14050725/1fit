import {  SuperAdminCreateController } from "@controllers";
import { verifyToken } from "@middlewares";
import { Router } from "express";

const createAndGetMeSuperAdminRouter = Router();

// Super admin yaratish
createAndGetMeSuperAdminRouter.post("/create", SuperAdminCreateController.createSuperAdmin);
createAndGetMeSuperAdminRouter.get("/getMe", SuperAdminCreateController.getSuperAdmin);


export  {createAndGetMeSuperAdminRouter};
