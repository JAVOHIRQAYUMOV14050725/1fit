import { UserGymController } from "@controllers";
import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";

const userGymRouter = Router();

userGymRouter.get("/getAll",verifyToken,checkRole(Role.ADMIN),UserGymController.getAllUserGyms);


userGymRouter.get("/get/:id",verifyToken,checkRole(Role.ADMIN),UserGymController.getUserGymById);

userGymRouter.post("/create",verifyToken,checkRole(Role.ADMIN),UserGymController.createUserGym);

userGymRouter.patch("/update/:id",verifyToken,checkRole(Role.ADMIN),UserGymController.updateUserGym);

userGymRouter.delete("/delete/:id",verifyToken,checkRole(Role.ADMIN),UserGymController.deleteUserGym);

export  {userGymRouter};
