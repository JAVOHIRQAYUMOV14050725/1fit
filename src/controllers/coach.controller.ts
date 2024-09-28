import dotenv from 'dotenv';
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "@errors";
import { access_token, new_refresh_token } from '@utils';

dotenv.config();

const prisma = new PrismaClient();

const handleError = (error: unknown, next: NextFunction, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : "noma'lum xatolik yuz berdi";
    next(new ErrorHandler(`${defaultMessage}: ${message}`, 500));
};

export class CoachController {
    static async getAllCoaches(req: Request, res: Response, next: NextFunction) {
        try {
            const coaches = await prisma.user.findMany({ where: { role: "COACH" } });
            res.status(200).json({
                message: "Murabbiylar muvaffaqiyatli olindi.",
                data: coaches,
            });
        } catch (error) {
            handleError(error, next, "Murabbiylarni olishda xatolik");
        }
    }

    static async getCoachById(req: Request, res: Response, next: NextFunction) {
        try {
            const coach = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });

            if (!coach || coach.role !== "COACH") {
                const allCoaches = await prisma.user.findMany({ where: { role: "COACH" } });

                if (allCoaches.length === 0) {
                    return next(new ErrorHandler("Bizda hech qanday Murabbiy mavjud emas", 404));
                }

                return next(new ErrorHandler(`Murabbiy topilmadi. Mavjud Murabbiylar idsi: ${allCoaches.map(c => c.id).join(', ')}`, 404));
            }

            const accessToken = access_token(coach.id);
            const refreshToken = new_refresh_token(coach.id);

            await prisma.user.update({
                where: { id: coach.id },
                data: { refresh_token: refreshToken },
            });

            res.status(200).json({
                message: "Murabbiy muvaffaqiyatli olindi.",
                coach,
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        } catch (error) {
            handleError(error, next, "Murabbiyni olishda xatolik");
        }
    }

    static async createCoach(req: Request, res: Response, next: NextFunction) {
        const { user_github_platform_id, username, email, provider } = req.body;

        const missingFields = CoachController.validateCoachFields({ user_github_platform_id, username, email, provider });
        if (missingFields.length > 0) {
            return next(new ErrorHandler(`Kerakli maydonlar to'ldirilmagan: ${missingFields.join(', ')}`, 400));
        }

        try {
            const newCoach = await prisma.user.create({
                data: {
                    user_github_platform_id,
                    username: username.trim(),
                    email,
                    role: "COACH", // Faqat COACH rolini o'rnatish
                },
            });

            const accessToken = access_token(newCoach.id);
            const refreshToken = new_refresh_token(newCoach.id);

            await prisma.user.update({
                where: { id: newCoach.id },
                data: { refresh_token: refreshToken },
            });

            res.status(201).json({
                message: "Yangi murabbiy muvaffaqiyatli yaratildi.",
                coach: newCoach,
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        } catch (error) {
            if (error instanceof Error && (error as any).code === 'P2002') {
                return next(new ErrorHandler("Foydalanuvchi allaqachon mavjud", 409));
            }
            handleError(error, next, "Coach qo'shishda xatolik");
        }
    }

    static async updateCoach(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { username, email } = req.body;

        if (!username?.trim() && !email?.includes('@')) {
            return next(new ErrorHandler("Yangilash uchun kamida bitta maydon kiriting", 400));
        }

        try {
            const coach = await prisma.user.findUnique({ where: { id: parseInt(id) } });

            if (!coach || coach.role !== "COACH") {
                const allCoaches = await prisma.user.findMany({ where: { role: "COACH" } });

                if (allCoaches.length === 0) {
                    return next(new ErrorHandler("Bizda hech qanday Murabbiy mavjud emas", 404));
                }

                return next(new ErrorHandler(`Murabbiy topilmadi. Mavjud Murabbiylar idsi: ${allCoaches.map(c => c.id).join(', ')}`, 404));
            }

            const updatedCoach = await prisma.user.update({
                where: { id: parseInt(id) },
                data: { username: username?.trim(), email },
            });

            const accessToken = access_token(updatedCoach.id);
            const refreshToken = new_refresh_token(updatedCoach.id);

            await prisma.user.update({
                where: { id: updatedCoach.id },
                data: { refresh_token: refreshToken },
            });

            res.status(200).json({
                message: "Coach muvaffaqiyatli yangilandi.",
                coach: updatedCoach,
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        } catch (error) {
            if (error instanceof Error && (error as any).code === 'P2025') {
                const allCoaches = await prisma.user.findMany({ where: { role: "COACH" } });

                if (allCoaches.length === 0) {
                    return next(new ErrorHandler("Bizda hech qanday murabbiy mavjud emas", 404));
                }

                return next(new ErrorHandler(`Murabbiy topilmadi. Mavjud murabbiylar: ${allCoaches.map(c => c.id).join(', ')}`, 404));
            }
            handleError(error, next, "Murabbiyni yangilashda xatolik");
        }
    }

    static async deleteCoach(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const coach = await prisma.user.findUnique({ where: { id: parseInt(id) } });

            if (!coach || coach.role !== "COACH") {
                const allCoaches = await prisma.user.findMany({ where: { role: "COACH" } });

                if (allCoaches.length === 0) {
                    return next(new ErrorHandler("Bizda hech qanday Murabbiy mavjud emas", 404));
                }

                return next(new ErrorHandler(`Murabbiy topilmadi. Mavjud Murabbiylar idsi: ${allCoaches.map(c => c.id).join(', ')}`, 404));
            }

            await prisma.user.delete({ where: { id: parseInt(id) } });
            res.status(200).json({
                message: "Murabbiy muvaffaqiyatli o'chirildi.",
            });
        } catch (error) {
            if (error instanceof Error && (error as any).code === 'P2025') {
                const allCoaches = await prisma.user.findMany({ where: { role: "COACH" } });

                if (allCoaches.length === 0) {
                    return next(new ErrorHandler("Bizda hech qanday murabbiy mavjud emas", 404));
                }

                return next(new ErrorHandler(`Murabbiy topilmadi. Mavjud murabbiylar: ${allCoaches.map(c => c.id).join(', ')}`, 404));
            }
            handleError(error, next, "Murabbiyni o'chirishda xatolik");
        }
    }

    private static validateCoachFields(fields: any): string[] {
        const missingFields: string[] = [];
        if (!fields.user_github_platform_id) missingFields.push("user_github_platform_id");
        if (!fields.username?.trim()) missingFields.push("username");
        if (!fields.email?.includes('@')) missingFields.push("email");
        if (!fields.provider) missingFields.push("provider");
        return missingFields;
    }
}
