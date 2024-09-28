import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from '@errors';

dotenv.config();

const prisma = new PrismaClient();

const hasSuperAdminAccess = (req: Request) => {
    return req.user && (req.user.role === "SUPER_ADMIN");
};

const hasAdminAccess = (req: Request, gymId: number) => {
    return req.user?.adminGym?.some(admin => admin.gymId === gymId) ?? false;
};


export class GymController {
    static async getAllGyms(req: Request, res: Response, next: NextFunction) {
        try {
            const gyms = await prisma.gym.findMany({
                include: {
                    gymSport: {
                        include: { sport: true },
                    },
                   
                },
            });
            res.status(200).json({
                message: "Gymlar muvaffaqiyatli olindi.",
                data: gyms,
            });
        } catch (error) {
            next(new ErrorHandler("Gymlarni olishda xatolik", 500));
        }
    }

    static async getGymById(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const gym = await prisma.gym.findUnique({ 
                where: { id: parseInt(id) },
                include: {
                    gymSport: {
                        include: { sport: true },
                    }
                    
                },
            });

            if (!gym) {
                const gymIds = await prisma.gym.findMany({
                    select: { id: true }
                }).then(gyms => gyms.map(g => g.id));
                return next(new ErrorHandler(`Gym topilmadi. Mavjud gym ID'lari: ${gymIds.join(", ")}`, 404));
            }

            res.status(200).json({
                message: "Gym muvaffaqiyatli olindi.",
                gym,
            });
        } catch (error) {
            next(new ErrorHandler("Gymni olishda xatolik", 500));
        }
    }

    static async createGym(req: Request, res: Response, next: NextFunction) {
        if (!hasSuperAdminAccess(req)) {
            return next(new ErrorHandler("Sizda gym qo'shish uchun ruxsat yo'q", 403));
        }

        const { title, location } = req.body;
        if (!title || !location) {
            return next(new ErrorHandler("Kerakli maydonlar to'ldirilmagan: title, location", 400));
        }

        try {
            const newGym = await prisma.gym.create({ data: { title, location } });
            res.status(201).json({
                message: "Yangi gym muvaffaqiyatli yaratildi.",
                gym: newGym,
            });
        } catch (error) {
            next(new ErrorHandler("Gym qo'shishda xatolik", 500));
        }
    }

    static async updateGym(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        const gym = await prisma.gym.findUnique({ 
            where: { id: parseInt(id) },
            include: {
                adminGym: true
            }
        });

        if (!gym) {
            const gymIds = await prisma.gym.findMany({
                select: { id: true }
            }).then(gyms => gyms.map(g => g.id));
            return next(new ErrorHandler(`Gym topilmadi. Mavjud gym ID'lari: ${gymIds.join(", ")}`, 404));
        }

        if (!hasSuperAdminAccess(req) && !hasAdminAccess(req, gym.id)) {
            return next(new ErrorHandler("Sizda gymni yangilash uchun ruxsat yo'q", 403));
        }

        const { title, location } = req.body;

        try {
            const updatedGym = await prisma.gym.update({
                where: { id: parseInt(id) },
                data: { title, location },
            });

            res.status(200).json({
                message: "Gym muvaffaqiyatli yangilandi.",
                gym: updatedGym,
            });
        } catch (error) {
            next(new ErrorHandler("Gymni yangilashda xatolik", 500));
        }
    }

    static async deleteGym(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        const gym = await prisma.gym.findUnique({ where: { id: parseInt(id) } });
        if (!gym) {
            const gymIds = await prisma.gym.findMany({
                select: { id: true }
            }).then(gyms => gyms.map(g => g.id));
            return next(new ErrorHandler(`Gym topilmadi. Mavjud gym ID'lari: ${gymIds.join(", ")}`, 404));
        }

        if (!hasSuperAdminAccess(req)) {
            return next(new ErrorHandler("Sizda gymni o'chirish uchun ruxsat yo'q", 403));
        }

        try {
            await prisma.gym.delete({ where: { id: parseInt(id) } });

            res.status(200).json({
                message: "Gym muvaffaqiyatli o'chirildi.",
            });
        } catch (error) {
            next(new ErrorHandler("Gymni o'chirishda xatolik", 500));
        }
    }

    static async searchGyms(req: Request, res: Response, next: NextFunction) {
        const { search } = req.body;

        if (!search) {
            return next(new ErrorHandler("Qidiruv maydoni bo'sh bo'lmasligi kerak", 400));
        }

        try {
            const gyms = await prisma.gym.findMany({
                where: {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' }},
                        { location: { contains: search, mode: 'insensitive' }},
                    ],
                },
                include: {
                    gymSport: {
                        include: { sport: true },
                    },
                },
            });

            if (gyms.length === 0) {
                return res.status(404).json({ message: "Gym topilmadi." });
            }

            res.status(200).json({
                message: "Gymlar muvaffaqiyatli topildi.",
                data: gyms,
            });
        } catch (error) {
            next(new ErrorHandler("Gymlarni qidirishda xatolik", 500));
        }
    }
}
