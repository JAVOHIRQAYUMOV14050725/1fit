import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "@errors";
import { access_token, new_refresh_token } from "@utils"; 

const prisma = new PrismaClient();

export class SuperAdminCreateController {
    static async createSuperAdmin(req: Request, res: Response, next: NextFunction) {
        const { user_github_platform_id, username, email, provider } = req.body;

        if (!username?.trim() || !email?.includes('@') || !user_github_platform_id) {
            return next(new ErrorHandler("Kerakli maydonlar noto'g'ri to'ldirilgan", 400));
        }

        try {
            const existingSuperAdmin = await prisma.user.findFirst({
                where: { role: 'SUPER_ADMIN' }
            });

            if (existingSuperAdmin) {
                return next(new ErrorHandler("Super admin allaqachon mavjud", 409));
            }

            const newSuperAdmin = await prisma.user.create({
                data: {
                    user_github_platform_id,
                    username: username.trim(),
                    email,
                    role: "SUPER_ADMIN",
                    provider
                }
            });

            const accessToken = access_token(newSuperAdmin.id);
            const refreshToken = new_refresh_token(newSuperAdmin.id);

            await prisma.user.update({
                where: { id: newSuperAdmin.id },
                data: {
                    access_token: accessToken, 
                    refresh_token: refreshToken  
                }
            });

            res.status(201).json({
                admin: newSuperAdmin,
                tokens: {
                    accessToken,
                    refreshToken
                }
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(new ErrorHandler("Super admin yaratishda xatolik: " + error.message, 500));
            } else {
                next(new ErrorHandler("Super admin yaratishda noma'lum xatolik yuz berdi", 500));
            }
        }
    }

    static async getSuperAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const superAdmin = await prisma.user.findFirst({
                where: { role: 'SUPER_ADMIN' }
            });

            if (!superAdmin) {
                return next(new ErrorHandler("Super admin topilmadi", 404));
            }

            res.status(200).json({
                success: true,
                data: superAdmin
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(new ErrorHandler("Super adminni olishda xatolik: " + error.message, 500));
            } else {
                next(new ErrorHandler("Super adminni olishda noma'lum xatolik yuz berdi", 500));
            }
        }
    }
}
