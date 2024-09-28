import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";
import { GymSportController } from "src/controllers/gymSport.controller";

const gymSportRouter = Router();

gymSportRouter.get("/getAll",verifyToken,checkRole(Role.ADMIN),GymSportController.getAllGymSports);


gymSportRouter.get("/get/:id",verifyToken,checkRole(Role.ADMIN),GymSportController.getGymSportById);

gymSportRouter.post("/create",verifyToken,checkRole(Role.ADMIN),GymSportController.createGymSport);

gymSportRouter.patch("/update/:id",verifyToken,checkRole(Role.ADMIN),GymSportController.updateGymSport);

gymSportRouter.delete("/delete/:id",verifyToken,checkRole(Role.ADMIN),GymSportController.deleteGymSport);

export  {gymSportRouter};
