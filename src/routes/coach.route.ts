import { CoachController } from "@controllers";
import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";

const coachRouter = Router();

coachRouter.get("/getAll",verifyToken,checkRole(Role.ADMIN), CoachController.getAllCoaches);

coachRouter.get("/get/:id",verifyToken,checkRole(Role.ADMIN), CoachController.getCoachById);

coachRouter.post("/create",verifyToken,checkRole(Role.ADMIN), CoachController.createCoach);

coachRouter.patch("/update/:id",verifyToken,checkRole(Role.ADMIN), CoachController.updateCoach);

coachRouter.delete("/delete/:id",verifyToken,checkRole(Role.ADMIN), CoachController.deleteCoach);

export  {coachRouter};
