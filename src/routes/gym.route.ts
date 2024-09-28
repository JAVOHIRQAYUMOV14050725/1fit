import { GymController } from "@controllers";
import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";

const gymRouter = Router();

gymRouter.get("/getAll",GymController.getAllGyms);

gymRouter.get("/search",GymController.searchGyms);

gymRouter.get("/get/:id",GymController.getGymById);

gymRouter.post("/create",verifyToken,checkRole(Role.SUPER_ADMIN),GymController.createGym);

gymRouter.patch("/update/:id",verifyToken,checkRole(Role.SUPER_ADMIN),GymController.updateGym);

gymRouter.delete("/delete/:id",verifyToken,checkRole(Role.SUPER_ADMIN),GymController.deleteGym);

export  {gymRouter};
