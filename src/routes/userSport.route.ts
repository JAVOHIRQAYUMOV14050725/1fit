import { SportUserController } from "@controllers";
import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";

const userSportRouter = Router();

userSportRouter.get("/getAll",verifyToken,checkRole(Role.ADMIN),SportUserController.getAllSportUsers);


userSportRouter.get("/get/:id",verifyToken,checkRole(Role.ADMIN),SportUserController.getSportUserById);

userSportRouter.post("/create",verifyToken,checkRole(Role.ADMIN),SportUserController.createSportUser);

userSportRouter.patch("/update/:id",verifyToken,checkRole(Role.ADMIN),SportUserController.updateSportUser);

userSportRouter.delete("/delete/:id",verifyToken,checkRole(Role.ADMIN),SportUserController.deleteSportUser);

export  {userSportRouter};
