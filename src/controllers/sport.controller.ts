import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from '@errors';

dotenv.config();

const prisma = new PrismaClient();

const hasAdminAccess = (req: Request) => {
    return req.user && (req.user.role === "SUPER_ADMIN");
};

export class SportController {
    static async getAllSports(req: Request, res: Response, next: NextFunction) {
        try {
            const sports = await prisma.sport.findMany({
                include: {
                    gymSport: {
                        include: {
                    gym:true
                        }, 
                    },
                },
            });
            res.status(200).json({
                message: "Sportlar muvaffaqiyatli olindi.",
                data: sports,
            });
        } catch (error) {
            next(new ErrorHandler("Sportlarni olishda xatolik", 500));
        }
    }

    static async getSportById(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const sport = await prisma.sport.findUnique({
                where: { id: parseInt(id) },
                include: {
                    gymSport: {
                        include: {
                    gym:true
                        },
                        
                    },
                },
                
            });
            if (!sport) {
                const allSports = await prisma.sport.findMany({ select: { id: true } }); // Faqat ID'larni olish
                const sportIds = allSports.map(s => s.id);
                return res.status(404).json({
                    message: `Sport topilmadi. Mavjud sport ID'lari: ${sportIds.join(", ")}`,
                });
            }
            res.status(200).json({
                message: "Sport muvaffaqiyatli olindi.",
                sport,
            });
        } catch (error) {
            next(new ErrorHandler("Sportni olishda xatolik", 500));
        }
    }

    static async createSport(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Sizda sport qo'shish uchun ruxsat yo'q", 403));
        }

        const { name, description } = req.body;

        if (!name || !description) {
            return next(new ErrorHandler("Kerakli maydonlar to'ldirilmagan: name, description", 400));
        }

        try {
            const newSport = await prisma.sport.create({
                data: {
                    name,
                    description,
                },
            });

            res.status(201).json({
                message: "Yangi sport muvaffaqiyatli yaratildi.",
                sport: newSport,
            });
        } catch (error) {
            next(new ErrorHandler("Sport qo'shishda xatolik", 500));
        }
    }

    static async updateSport(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Sizda sportni yangilash uchun ruxsat yo'q", 403));
        }

        const { id } = req.params;
        const { name, description } = req.body;

        try {
            const sport = await prisma.sport.findUnique({ where: { id: parseInt(id) } });
            if (!sport) {
                const allSports = await prisma.sport.findMany({ select: { id: true } }); // Faqat ID'larni olish
                const sportIds = allSports.map(s => s.id);
                return next(new ErrorHandler(`Sport topilmadi. Mavjud sport ID'lari: ${sportIds.join(", ")}`, 404));
            }

            const updatedSport = await prisma.sport.update({
                where: { id: parseInt(id) },
                data: { name, description },
            });

            res.status(200).json({
                message: "Sport muvaffaqiyatli yangilandi.",
                sport: updatedSport,
            });
        } catch (error) {
            next(new ErrorHandler("Sportni yangilashda xatolik", 500));
        }
    }

    static async deleteSport(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Sizda sportni o'chirish uchun ruxsat yo'q", 403));
        }

        const { id } = req.params;

        try {
            const sport = await prisma.sport.findUnique({ where: { id: parseInt(id) } });
            if (!sport) {
                const allSports = await prisma.sport.findMany({ select: { id: true } }); // Faqat ID'larni olish
                const sportIds = allSports.map(s => s.id);
                return next(new ErrorHandler(`Sport topilmadi. Mavjud sport ID'lari: ${sportIds.join(", ")}`, 404));
            }

            await prisma.sport.delete({ where: { id: parseInt(id) } });

            res.status(200).json({
                message: "Sport muvaffaqiyatli o'chirildi.",
            });
        } catch (error) {
            next(new ErrorHandler("Sportni o'chirishda xatolik", 500));
        }
    }

    static async searchSports(req: Request, res: Response, next: NextFunction) {
        const { search } = req.body;

        if (!search) {
            return next(new ErrorHandler("Qidiruv maydoni bo'sh bo'lmasligi kerak", 400));
        }

        try {
            const sports = await prisma.sport.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: search as string,
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: search as string,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
                include: {
                    gymSport: {
                        include: {
                    gym:true
                        },
                        
                    },
                },
            });

            if (sports.length === 0) {
                return res.status(404).json({
                    message: "Sport topilmadi.",
                });
            }

            res.status(200).json({
                message: "Sportlar muvaffaqiyatli qidirildi.",
                data: sports,
            });
        } catch (error) {
            next(new ErrorHandler("Sportlarni qidirishda xatolik", 500));
        }
    }
}
