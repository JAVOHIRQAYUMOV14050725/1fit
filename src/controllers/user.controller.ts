


import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export class UserController {
    static async getMyself(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = req.user; 

            if (!userData) {
                return res.status(401).send({
                    success: false,
                    message: "Foydalanuvchi ma'lumotlari topilmadi"
                });
            }

            res.status(200).send({
                success: true,
                message: "Foydalanuvchi muvaffaqiyatli topildi",
                data: {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt,
                    access_token: userData.access_token,
                    refresh_token: userData.refresh_token
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
