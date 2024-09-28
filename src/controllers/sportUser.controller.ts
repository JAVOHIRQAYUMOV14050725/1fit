import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from '@errors';

dotenv.config();

const prisma = new PrismaClient();

const hasAdminAccess = (req: Request) => {
    return req.user && (req.user.role === 'ADMIN');
};

const checkSportExists = async (sport_id: number) => {
    const sport = await prisma.sport.findUnique({ where: { id: sport_id } });
    return !!sport;
};

const checkUserExists = async (user_id: number) => {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    return !!user;
};

export class SportUserController {
    static async getAllSportUsers(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar kirishi mumkin", 403));
        }

        try {
            const sportUsers = await prisma.sportUser.findMany({
                include: {
                    user: true,
                    sport: true,
                },
            });
            res.status(200).json({
                message: "Barcha sport foydalanuvchilari muvaffaqiyatli olindi.",
                data: sportUsers,
            });
        } catch (error) {
            next(new ErrorHandler("Sport foydalanuvchilarini olishda xatolik", 500));
        }
    }

    static async getSportUserById(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar kirishi mumkin", 403));
        }

        const { id } = req.params;
        try {
            const sportUser = await prisma.sportUser.findUnique({
                where: { id: parseInt(id) },
                include: {
                    user: true,
                    sport: true,
                },
            });
            if (!sportUser) {
                return next(new ErrorHandler("Sport foydalanuvchisi topilmadi", 404));
            }
            res.status(200).json({
                message: "Sport foydalanuvchisi muvaffaqiyatli olindi.",
                sportUser,
            });
        } catch (error) {
            next(new ErrorHandler("Sport foydalanuvchisini olishda xatolik", 500));
        }
    }

   
    static async createSportUser(req: Request, res: Response, next: NextFunction) {
        const { user_id, sport_id } = req.body;

        if (!user_id || !sport_id) {
            return next(new ErrorHandler("Kerakli maydonlar to'ldirilmagan: user_id, sport_id", 400));
        }

        try {
            const userExists = await prisma.user.findUnique({
                where: { id: user_id },
                select: { id: true } 
            });

            if (!userExists) {
                const allCustomerIds = await prisma.user.findMany({
                    select: { id: true }
                });
                const ids = allCustomerIds.map(c => c.id);
                return next(new ErrorHandler(`Mijoz topilmadi. Mavjud mijoz IDlar: ${ids.join(", ")}`, 404));
            }

            const sportExists = await prisma.sport.findUnique({
                where: { id: sport_id },
                select: { id: true } 
            });

            if (!sportExists) {
                const allSportIds = await prisma.sport.findMany({
                    select: { id: true }
                });
                const ids = allSportIds.map(s => s.id);
                return next(new ErrorHandler(`Sport topilmadi. Mavjud sport IDlar: ${ids.join(", ")}`, 404));
            }

            const newSportUser = await prisma.sportUser.create({
                data: {
                    user_id,
                    sport_id,
                },
                include:{
                    sport:true,
                    user:true
                }
            });

            res.status(201).json({
                message: "Yangi sport foydalanuvchisi muvaffaqiyatli yaratildi.",
                sportUser: newSportUser,
            });
        } catch (error) {
            next(new ErrorHandler("Sport foydalanuvchisini qo'shishda xatolik", 500));
        }
    }

    static async updateSportUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { user_id, sport_id } = req.body;

        try {
            const sportUser = await prisma.sportUser.findUnique({ where: { id: parseInt(id) } });
            if (!sportUser) {
                return next(new ErrorHandler("Sport foydalanuvchisi topilmadi", 404));
            }

            const userExists = await prisma.user.findUnique({
                where: { id: user_id },
                select: { id: true } 
            });

            if (!userExists) {
                const allCustomerIds = await prisma.user.findMany({
                    select: { id: true }
                });
                const ids = allCustomerIds.map(c => c.id);
                return next(new ErrorHandler(`Mijoz topilmadi. Mavjud mijoz IDlar: ${ids.join(", ")}`, 404));
            }

            const sportExists = await prisma.sport.findUnique({
                where: { id: sport_id },
                select: { id: true } 
            });

            if (!sportExists) {
                const allSportIds = await prisma.sport.findMany({
                    select: { id: true }
                });
                const ids = allSportIds.map(s => s.id);
                return next(new ErrorHandler(`Sport topilmadi. Mavjud sport IDlar: ${ids.join(", ")}`, 404));
            }

            const updatedSportUser = await prisma.sportUser.update({
                where: { id: parseInt(id) },
                data: { user_id, sport_id },
                include:{
                    sport:true,
                    user:true
                }
            });

            res.status(200).json({
                message: "Sport foydalanuvchisi muvaffaqiyatli yangilandi.",
                sportUser: updatedSportUser,
            });
        } catch (error) {
            next(new ErrorHandler("Sport foydalanuvchisini yangilashda xatolik", 500));
        }
    }


    static async deleteSportUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const sportUser = await prisma.sportUser.findUnique({ where: { id: parseInt(id) } });
            if (!sportUser) {
                return next(new ErrorHandler("Sport foydalanuvchisi topilmadi", 404));
            }

            await prisma.sportUser.delete({ where: { id: parseInt(id) } });

            res.status(200).json({
                message: "Sport foydalanuvchisi muvaffaqiyatli o'chirildi.",
            });
        } catch (error) {
            next(new ErrorHandler("Sport foydalanuvchisini o'chirishda xatolik", 500));
        }
    }
}
