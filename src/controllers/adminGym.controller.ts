import { NextFunction, Request, Response } from "express";
import { PrismaClient } from '@prisma/client'; 
import { ErrorHandler } from '@errors';

const prisma = new PrismaClient();

export class AdminGymController {
    static async createAdminGym(req: Request, res: Response, next: NextFunction) {
        const { adminId, gymId } = req.body;

        if (!adminId || !gymId) {
            return next(new ErrorHandler("Kerakli maydonlarni kiritishingiz kerak: adminId, gymId.", 400));
        }

        try {
            const [userExists, gymExists] = await Promise.all([
                prisma.user.findUnique({ where: { id: adminId } }),
                prisma.gym.findUnique({ where: { id: gymId } }),
            ]);

            if (!userExists) {
                const { adminIds } = await AdminGymController.getAllIds();
                return next(new ErrorHandler(`Berilgan admin ID (${adminId}) bazada mavjud emas. Mavjud admin IDlar: ${adminIds.join(', ')}.`, 404));
            }

            if (!gymExists) {
                return next(new ErrorHandler(`Berilgan gym ID (${gymId}) bazada mavjud emas.`, 404));
            }

            const existingAdminGym = await prisma.adminGym.findUnique({
                where: { adminId_gymId: { adminId, gymId } },
            });

            if (existingAdminGym) {
                return next(new ErrorHandler("Bu gymda allaqachon admin mavjud.", 400));
            }

            const newAdminGym = await prisma.adminGym.create({
                data: { adminId, gymId },
            });

            res.status(201).json({ status: 'success', data: newAdminGym });
        } catch (error) {
            return next(new ErrorHandler("AdminGym qo'shishda xatolik yuz berdi", 500));
        }
    }

    static async deleteAdminGym(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const adminGymExists = await prisma.adminGym.findUnique({
                where: { id: Number(id) },
            });

            if (!adminGymExists) {
                return next(new ErrorHandler("Berilgan ID bo'yicha admin gym topilmadi.", 404));
            }

            const deletedAdminGym = await prisma.adminGym.delete({
                where: { id: Number(id) },
            });
            res.status(200).json({ status: 'success', data: deletedAdminGym });
        } catch (error) {
            return next(new ErrorHandler("AdminGym o'chirishda xatolik yuz berdi", 500));
        }
    }

    static async getAdminsByGym(req: Request, res: Response, next: NextFunction) {
        const { gymId } = req.params;

        try {
            const admins = await prisma.adminGym.findMany({
                where: { gymId: Number(gymId) },
                include: { user: true },
            });

            if (admins.length === 0) {
                return next(new ErrorHandler("Bu gymda adminlar mavjud emas.", 404));
            }

            res.status(200).json({ status: 'success', data: admins });
        } catch (error) {
            return next(new ErrorHandler("Adminlarni olishda xatolik yuz berdi", 500));
        }
    }

    static async getAllAdminGyms(req: Request, res: Response, next: NextFunction) {
        try {
            const adminGyms = await prisma.adminGym.findMany({
                include: { user: true, gym: true },
            });
            res.status(200).json({ status: 'success', data: adminGyms });
        } catch (error) {
            return next(new ErrorHandler("Barcha AdminGymlarni olishda xatolik yuz berdi", 500));
        }
    }

    static async updateAdminGym(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { adminId, gymId } = req.body;

        if (!adminId || !gymId) {
            return next(new ErrorHandler("Kerakli maydonlarni kiritishingiz kerak: adminId, gymId.", 400));
        }

        try {
            const [userExists, gymExists] = await Promise.all([
                prisma.user.findUnique({ where: { id: adminId } }),
                prisma.gym.findUnique({ where: { id: gymId } }),
            ]);

            if (!userExists) {
                const { adminIds } = await AdminGymController.getAllIds();
                return next(new ErrorHandler(`Berilgan admin ID (${adminId}) bazada mavjud emas. Mavjud admin IDlar: ${adminIds.join(', ')}.`, 404));
            }

            if (!gymExists) {
                return next(new ErrorHandler(`Berilgan gym ID (${gymId}) bazada mavjud emas.`, 404));
            }

            const existingAdminGym = await prisma.adminGym.findUnique({
                where: { adminId_gymId: { adminId, gymId } },
            });

            if (existingAdminGym && existingAdminGym.id !== Number(id)) {
                return next(new ErrorHandler("Bu gymda allaqachon admin mavjud.", 400));
            }

            const adminGymToUpdate = await prisma.adminGym.findUnique({
                where: { id: Number(id) },
            });

            if (!adminGymToUpdate) {
                return next(new ErrorHandler("Yangilanish uchun berilgan ID bo'yicha admin gym topilmadi.", 404));
            }

            const updatedAdminGym = await prisma.adminGym.update({
                where: { id: Number(id) },
                data: { adminId, gymId },
            });
            res.status(200).json({ status: 'success', data: updatedAdminGym });
        } catch (error) {
            return next(new ErrorHandler("AdminGym yangilashda xatolik yuz berdi", 500));
        }
    }

    static async getAllIds(): Promise<{ adminIds: number[], gymIds: number[] }> {
        const allAdminIds = await prisma.user.findMany({ select: { id: true } });
        const allGymIds = await prisma.gym.findMany({ select: { id: true } });
        return {
            adminIds: allAdminIds.map(c => c.id), 
            gymIds: allGymIds.map(g => g.id),    
        };
    }
}

export default AdminGymController;
