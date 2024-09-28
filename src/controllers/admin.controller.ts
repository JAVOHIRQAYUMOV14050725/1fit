import dotenv from 'dotenv';
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "@errors";
import { access_token, new_refresh_token } from '@utils';

dotenv.config();

const prisma = new PrismaClient();

const handleError = (error: unknown, next: NextFunction, defaultMessage: string) => {
    if (error instanceof Error) {
        next(new ErrorHandler(defaultMessage + ": " + error.message, 500));
    } else {
        next(new ErrorHandler(defaultMessage + " noma'lum xatolik yuz berdi", 500));
    }
};

export class adminController {
    static async getAllAdmins(req: Request, res: Response, next: NextFunction) {
        try {
            const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
            res.status(200).json({
                message: "Adminlar muvaffaqiyatli olindi.",
                data: admins
            });
        } catch (error) {
            handleError(error, next, "Adminlarni olishda xatolik");
        }
    }

    static async getAdminById(req: Request, res: Response, next: NextFunction) {
        try {
            const admin = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } }); 
            if (!admin) {
                const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    
                if (admins.length === 0) {
                    return next(new ErrorHandler("Bizda hech qanday admin mavjud emas", 404));
                }
    
                return next(new ErrorHandler(`Admin topilmadi. Mavjud adminlar idsi: ${admins.map(admin => admin.id).join(', ')}`, 404));
            }

            if (!admin || admin.role !== 'ADMIN') {
                return next(new ErrorHandler("Admin topilmadi", 404));
            }

            const accessToken = access_token(admin.id);
            const refreshToken = new_refresh_token(admin.id);

            await prisma.user.update({
                where: { id: admin.id },
                data: { access_token: accessToken, refresh_token: refreshToken }
            });

            res.status(200).json({
                message: "Admin muvaffaqiyatli olindi.",
                admin,
                access_token: accessToken,
                refresh_token: refreshToken
            });
        } catch (error) {
            handleError(error, next, "Adminni olishda xatolik");
        }
    }

    static async createAdmin(req: Request, res: Response, next: NextFunction) {
        const { user_github_platform_id, username, email, provider } = req.body;

        const missingFields = adminController.validateAdminFields({ user_github_platform_id, username, email, provider });
        if (missingFields.length > 0) {
            return next(new ErrorHandler(`Kerakli maydonlar to'ldirilmagan: ${missingFields.join(', ')}`, 400));
        }

        try {
            const newAdmin = await prisma.user.create({
                data: {
                    user_github_platform_id,
                    username: username.trim(),
                    email,
                    role: "ADMIN",
                }
            });

            const accessToken = access_token(newAdmin.id);
            const refreshToken = new_refresh_token(newAdmin.id);

            await prisma.user.update({
                where: { id: newAdmin.id },
                data: { access_token: accessToken, refresh_token: refreshToken }
            });

            res.status(201).json({
                message: "Yangi admin muvaffaqiyatli yaratildi.",
                admin: newAdmin,
                access_token: accessToken,
                refresh_token: refreshToken
            });
        } catch (error) {
            if (error instanceof Error && (error as any).code === 'P2002') {
                return next(new ErrorHandler("Foydalanuvchi allaqachon mavjud", 409));
            }
            handleError(error, next, "Admin qo'shishda xatolik");
        }
    }

    static async updateAdmin(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { username, email } = req.body;
    
        if (!username?.trim() && !email?.includes('@')) {
            return next(new ErrorHandler("Yangilash uchun kamida bitta maydon kiriting", 400));
        }
    
        try {
            const admin = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    
            if (!admin) {
                const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    
                if (admins.length === 0) {
                    return next(new ErrorHandler("Bizda hech qanday admin mavjud emas", 404));
                }
    
                return next(new ErrorHandler(`Admin topilmadi. Mavjud adminlar idsi: ${admins.map(admin => admin.id).join(', ')}`, 404));
            }
    
            if (admin.role !== "ADMIN") {
                return next(new ErrorHandler("Sizda uni yangilash huquqi yo'q", 403));
            }
    
            const updatedAdmin = await prisma.user.update({
                where: { id: parseInt(id) },
                data: { 
                    username: username?.trim(), 
                    email 
                }
            });
    
            const accessToken = access_token(updatedAdmin.id);
            const refreshToken = new_refresh_token(updatedAdmin.id);
    
            await prisma.user.update({
                where: { id: updatedAdmin.id },
                data: { access_token: accessToken, refresh_token: refreshToken }
            });
    
            res.status(200).json({
                message: "Admin muvaffaqiyatli yangilandi.",
                admin: updatedAdmin,
                access_token: accessToken,
                refresh_token: refreshToken
            });
        } catch (error) {
            handleError(error, next, "Adminni yangilashda xatolik");
        }
    }
    
    static async deleteAdmin(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
    
        try {
            const admin = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    
            if (!admin) {
                const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    
                if (admins.length === 0) {
                    return next(new ErrorHandler("Bizda hech qanday admin mavjud emas", 404));
                }
    
                return next(new ErrorHandler(`Admin topilmadi. Mavjud adminlar idsi: ${admins.map(admin => admin.id).join(', ')}`, 404));
            }
    
            if (admin.role !== "ADMIN") {
                return next(new ErrorHandler("Sizda uni o'chirish huquqi yo'q", 403));
            }
    
            await prisma.user.delete({ where: { id: parseInt(id) } });
            res.status(200).json({
                message: "Admin muvaffaqiyatli o'chirildi."
            });
        } catch (error) {
            handleError(error, next, "Adminni o'chirishda xatolik");
        }
    }
    

    private static validateAdminFields(fields: any): string[] {
        const missingFields: string[] = [];
        if (!fields.user_github_platform_id) missingFields.push("user_github_platform_id");
        if (!fields.username?.trim()) missingFields.push("username");
        if (!fields.email?.includes('@')) missingFields.push("email");
        if (!fields.provider) missingFields.push("provider");
        return missingFields;
    }
}
