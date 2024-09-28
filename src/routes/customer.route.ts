import { CustomerController } from "@controllers";
import { checkRole, verifyToken } from "@middlewares";
import { Role } from "@prisma/client";
import { Router } from "express";

const customerRouter = Router();

customerRouter.get("/getAll",verifyToken,checkRole(Role.ADMIN),CustomerController.getAllCustomers);

customerRouter.get("/get/:id",verifyToken,checkRole(Role.ADMIN),CustomerController.getCustomerById);

customerRouter.patch("/update/:id",verifyToken,checkRole(Role.ADMIN),CustomerController.updateCustomer);

customerRouter.delete("/delete/:id",verifyToken,checkRole(Role.ADMIN),CustomerController.deleteCustomer);

export  {customerRouter};
