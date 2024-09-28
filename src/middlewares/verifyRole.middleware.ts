import { ErrorHandler } from "@errors";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export function checkRole(requiredRole: Role) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            return next(new ErrorHandler("User role is not defined", 401));
        }

        if (req.user.role !== requiredRole) {
            return next(new ErrorHandler("Forbidden: Access denied", 403));
        }

        next();
    };
}
