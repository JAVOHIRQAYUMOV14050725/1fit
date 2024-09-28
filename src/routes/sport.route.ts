import { SportController } from "@controllers";
import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";

const sportRouter = Router();

sportRouter.get("/getAll",SportController.getAllSports);

sportRouter.get("/search",SportController.searchSports);

sportRouter.get("/get/:id",SportController.getSportById);

sportRouter.post("/create",verifyToken,checkRole(Role.SUPER_ADMIN),SportController.createSport);

sportRouter.patch("/update/:id",verifyToken,checkRole(Role.SUPER_ADMIN),SportController.updateSport);

sportRouter.delete("/delete/:id",verifyToken,checkRole(Role.SUPER_ADMIN),SportController.deleteSport);

export  {sportRouter};
