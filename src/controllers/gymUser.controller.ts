import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from '@errors';

dotenv.config();

const prisma = new PrismaClient();

const hasAdminAccess = (req: Request) => {
    return req.user && req.user.role === 'ADMIN';
};

export class UserGymController {
    static async getAllUserGyms(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar kirishi mumkin", 403));
        }

        try {
            const userGyms = await prisma.gymUser.findMany({
                include: {
                    user: true,
                    gym: true,
                },
            });
            res.status(200).json({
                message: "Barcha gym-user bog'lanishlari muvaffaqiyatli olindi.",
                data: userGyms,
            });
        } catch (error) {
            next(new ErrorHandler("Gym-user bog'lanishlarini olishda xatolik", 500));
        }
    }

    static async getUserGymById(req: Request, res: Response, next: NextFunction) {
        if (!hasAdminAccess(req)) {
            return next(new ErrorHandler("Faqat adminlar kirishi mumkin", 403));
        }

        const { id } = req.params;
        try {
            const userGym = await prisma.gymUser.findUnique({
                where: { id: parseInt(id) },
                include: {
                    user: true,
                    gym: true,
                },
            });
            if (!userGym) {
                return next(new ErrorHandler("Gym-user bog'lanishi topilmadi", 404));
            }
            res.status(200).json({
                message: "Gym-user bog'lanishi muvaffaqiyatli olindi.",
                userGym,
            });
        } catch (error) {
            next(new ErrorHandler("Gym-user bog'lanishini olishda xatolik", 500));
        }
    }

    static async createUserGym(req: Request, res: Response, next: NextFunction) {
        const { user_id, gym_id } = req.body;

        if (!user_id || !gym_id) {
            return next(new ErrorHandler("Kerakli maydonlar to'ldirilmagan: user_id, gym_id", 400));
        }

        try {
            const customer = await prisma.user.findUnique({ where: { id: user_id } });
            if (!customer || customer.role !== "CUSTOMER") {
                const allCustomerIds = await prisma.user.findMany({
                    where: { role: "CUSTOMER" },
                    select: { id: true }
                });
                const ids = allCustomerIds.map(c => c.id);
                return next(new ErrorHandler(`Mijoz topilmadi. Mavjud mijoz IDlar: ${ids.join(", ")}`, 404));
            }

            const gym = await prisma.gym.findUnique({ where: { id: gym_id } });
            if (!gym) {
                return next(new ErrorHandler("Gym topilmadi", 404));
            }

            const newUserGym = await prisma.gymUser.create({
                data: {
                    user_id,
                    gym_id,
                },
                include: {
                    user: true,
                    gym: true,
                },
            });

            res.status(201).json({
                message: "Yangi gym-user bog'lanishi muvaffaqiyatli yaratildi.",
                userGym: newUserGym,
            });
        } catch (error) {
            next(new ErrorHandler("Gym-user bog'lanishini qo'shishda xatolik", 500));
        }
    }

    static async updateUserGym(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { user_id, gym_id } = req.body;

        try {
            const userGym = await prisma.gymUser.findUnique({ where: { id: parseInt(id) } });
            if (!userGym) {
                return next(new ErrorHandler("Gym-user bog'lanishi topilmadi", 404));
            }

            const customer = await prisma.user.findUnique({ where: { id: user_id } });
            if (!customer || customer.role !== "CUSTOMER") {
                const allCustomerIds = await prisma.user.findMany({
                    where: { role: "CUSTOMER" },
                    select: { id: true }
                });
                const ids = allCustomerIds.map(c => c.id);
                return next(new ErrorHandler(`Mijoz topilmadi. Mavjud mijoz IDlar: ${ids.join(", ")}`, 404));
            }

            const gym = await prisma.gym.findUnique({ where: { id: gym_id } });
            if (!gym) {
                return next(new ErrorHandler("Gym topilmadi", 404));
            }

            const updatedUserGym = await prisma.gymUser.update({
                where: { id: parseInt(id) },
                data: { user_id, gym_id },
                include: {
                    user: true,
                    gym: true,
                },
            });

            res.status(200).json({
                message: "Gym-user bog'lanishi muvaffaqiyatli yangilandi.",
                userGym: updatedUserGym,
            });
        } catch (error) {
            next(new ErrorHandler("Gym-user bog'lanishini yangilashda xatolik", 500));
        }
    }

    static async deleteUserGym(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const userGym = await prisma.gymUser.findUnique({ where: { id: parseInt(id) } });
            if (!userGym) {
                return next(new ErrorHandler("Gym-user bog'lanishi topilmadi", 404));
            }

            await prisma.gymUser.delete({ where: { id: parseInt(id) } });

            res.status(200).json({
                message: "Gym-user bog'lanishi muvaffaqiyatli o'chirildi.",
            });
        } catch (error) {
            next(new ErrorHandler("Gym-user bog'lanishini o'chirishda xatolik", 500));
        }
    }
}
