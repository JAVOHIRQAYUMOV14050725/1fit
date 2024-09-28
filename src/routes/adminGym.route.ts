import { AdminGymController } from "@controllers";
import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";

const adminGymRouter = Router();

adminGymRouter.get("/getAll",verifyToken,checkRole(Role.SUPER_ADMIN),AdminGymController.getAllIds);


adminGymRouter.get("/get/:gymId",verifyToken,checkRole(Role.SUPER_ADMIN),AdminGymController.getAdminsByGym);

adminGymRouter.post("/create",verifyToken,checkRole(Role.SUPER_ADMIN),AdminGymController.createAdminGym);

adminGymRouter.patch("/update/:id",verifyToken,checkRole(Role.SUPER_ADMIN),AdminGymController.updateAdminGym);

adminGymRouter.delete("/delete/:id",verifyToken,checkRole(Role.SUPER_ADMIN),AdminGymController.deleteAdminGym);

export  {adminGymRouter};
