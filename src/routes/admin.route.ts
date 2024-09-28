import { adminController } from "@controllers";
import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";

const adminRouter = Router();

adminRouter.get("/getAll",verifyToken,checkRole(Role.SUPER_ADMIN), adminController.getAllAdmins);

adminRouter.get("/get/:id",verifyToken,checkRole(Role.SUPER_ADMIN), adminController.getAdminById);

adminRouter.post("/create",verifyToken,checkRole(Role.SUPER_ADMIN), adminController.createAdmin);

adminRouter.patch("/update/:id",verifyToken,checkRole(Role.SUPER_ADMIN), adminController.updateAdmin);

adminRouter.delete("/delete/:id",verifyToken,checkRole(Role.SUPER_ADMIN), adminController.deleteAdmin);

export  {adminRouter};
