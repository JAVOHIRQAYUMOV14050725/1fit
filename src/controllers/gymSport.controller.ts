import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from '@errors';

dotenv.config();

const prisma = new PrismaClient();

const hasAdminAccess = (req: Request) => {
    return req.user && req.user.role === 'ADMIN';
};

export class GymSportController {
    static async getAllGymSports(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar kirishi mumkin", 403));
        }

        try {
            const gymSports = await prisma.gymSport.findMany({
                include: {
                    sport: true,
                    gym: true,
                },
            });
            res.status(200).json({
                message: "GymSportlar muvaffaqiyatli olindi.",
                data: gymSports,
            });
        } catch (error) {
            next(new ErrorHandler("GymSportlarni olishda xatolik", 500));
        }
    }

    static async getGymSportById(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar kirishi mumkin", 403));
        }

        const { id } = req.params;
        try {
            const gymSport = await prisma.gymSport.findUnique({
                where: { id: parseInt(id) },
                include: {
                    sport: true,
                    gym: true,
                },
            });

            if (!gymSport) {
                const allGymSports = await prisma.gymSport.findMany({
                    select: { id: true }
                });
                return res.status(404).json({
                    message: "GymSport topilmadi, lekin mana boshqa mavjud IDlar:",
                    availableGymSportIds: allGymSports.map(gs => gs.id)
                });
            }

            res.status(200).json({
                message: "GymSport muvaffaqiyatli olindi.",
                gymSport,
            });
        } catch (error) {
            next(new ErrorHandler("GymSportni olishda xatolik", 500));
        }
    }

    static async createGymSport(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar gymSport yaratishi mumkin", 403));
        }

        const { gym_id, sport_id } = req.body;

        if (!gym_id || !sport_id) {
            return next(new ErrorHandler("Kerakli maydonlar to'ldirilmagan: gym_id, sport_id", 400));
        }

        try {
            const newGymSport = await prisma.gymSport.create({
                data: {
                    gym_id,
                    sport_id,
                },
                include: {
                    sport: true,
                    gym: true,
                },
            });

            res.status(201).json({
                message: "Yangi GymSport muvaffaqiyatli yaratildi.",
                gymSport: newGymSport,
            });
        } catch (error) {
            next(new ErrorHandler("GymSport qo'shishda xatolik", 500));
        }
    }

    static async updateGymSport(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar gymSportni yangilashi mumkin", 403));
        }

        const { id } = req.params;
        const { gym_id, sport_id } = req.body;

        try {
            const gymSport = await prisma.gymSport.findUnique({
                where: { id: parseInt(id) }
            });

            if (!gymSport) {
                const allGymSports = await prisma.gymSport.findMany({
                    select: { id: true }
                });
                return res.status(404).json({
                    message: "Yangilanishi kerak bo'lgan GymSport topilmadi, mana mavjud IDlar:",
                    availableGymSportIds: allGymSports.map(gs => gs.id)
                });
            }

            const updatedGymSport = await prisma.gymSport.update({
                where: { id: parseInt(id) },
                data: { gym_id, sport_id },
                include: {
                    sport: true,
                    gym: true,
                },
            });

            res.status(200).json({
                message: "GymSport muvaffaqiyatli yangilandi.",
                gymSport: updatedGymSport,
            });
        } catch (error) {
            next(new ErrorHandler("GymSportni yangilashda xatolik", 500));
        }
    }

    static async deleteGymSport(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar gymSportni o'chirishi mumkin", 403));
        }

        const { id } = req.params;

        try {
            const gymSport = await prisma.gymSport.findUnique({
                where: { id: parseInt(id) }
            });

            if (!gymSport) {
                const allGymSports = await prisma.gymSport.findMany({
                    select: { id: true }
                });
                return res.status(404).json({
                    message: "O'chirilishi kerak bo'lgan GymSport topilmadi, mana mavjud IDlar:",
                    availableGymSportIds: allGymSports.map(gs => gs.id)
                });
            }

            await prisma.gymSport.delete({
                where: { id: parseInt(id) }
            });

            res.status(200).json({
                message: "GymSport muvaffaqiyatli o'chirildi.",
            });
        } catch (error) {
            next(new ErrorHandler("GymSportni o'chirishda xatolik", 500));
        }
    }
}
