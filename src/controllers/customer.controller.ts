import dotenv from 'dotenv';
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "@errors";

dotenv.config();

const prisma = new PrismaClient();

const handleError = (error: unknown, next: NextFunction, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : "noma'lum xatolik yuz berdi";
    next(new ErrorHandler(`${defaultMessage}: ${message}`, 500));
};

const isAdmin = (req: Request) => req.user && req.user.role === "ADMIN";

export class CustomerController {
    static async getAllCustomers(req: Request, res: Response, next: NextFunction) {
        if (!isAdmin(req)) {
            return next(new ErrorHandler("Sizda mijozlarni ko'rish uchun ruxsat yo'q", 403));
        }

        try {
            const customers = await prisma.user.findMany({
                where: { role: "CUSTOMER" }, 
                include: {
                    gymSport: {
                        select: {
                            gym: true
                        }
                    },
                    sportUser: {
                        select: {
                            sport: true
                        }
                    }
                }
            });

            if (customers.length === 0) {
                return next(new ErrorHandler("Mijoz topilmadi.", 404));
            }

            res.status(200).json({
                message: "Mijozlar muvaffaqiyatli olindi.",
                data: customers,
            });
        } catch (error) {
            handleError(error, next, "Mijozlarni olishda xatolik");
        }
    }

    static async getCustomerById(req: Request, res: Response, next: NextFunction) {
        if (!isAdmin(req)) {
            return next(new ErrorHandler("Sizda mijozni ko'rish uchun ruxsat yo'q", 403));
        }

        try {
            const customer = await prisma.user.findUnique({
                where: { id: parseInt(req.params.id) }, // Deleted bo'lmagan mijoz
                include: {
                    gymSport: {
                        select: {
                            gym: true
                        }
                    },
                    sportUser : {
                        select: {
                            sport: true
                        }
                    }
                }
            });

            if (!customer || customer.role !== "CUSTOMER") {
                const allCustomerIds = await prisma.user.findMany({
                    where: { role: "CUSTOMER" }, // Deleted bo'lmagan barcha mijozlar
                    select: { id: true }
                });
                const ids = allCustomerIds.map(c => c.id);
                return next(new ErrorHandler(`Mijoz topilmadi. Mavjud mijoz IDlar: ${ids.join(", ")}`, 404));
            }

            res.status(200).json({
                message: "Mijoz muvaffaqiyatli olindi.",
                customer,
            });
        } catch (error) {
            handleError(error, next, "Mijozni olishda xatolik");
        }
    }

    static async updateCustomer(req: Request, res: Response, next: NextFunction) {
        if (!isAdmin(req)) {
            return next(new ErrorHandler("Sizda mijozni yangilash uchun ruxsat yo'q", 403));
        }

        const { id } = req.params;
        const { firstName, lastName, username, email } = req.body;

        try {
            const customer = await prisma.user.findUnique({
                where: { id: parseInt(id) }, 
            });

            if (!customer || customer.role !== "CUSTOMER") {
                const allCustomerIds = await prisma.user.findMany({
                    where: { role: "CUSTOMER" }, // Deleted bo'lmagan barcha mijozlar
                    select: { id: true }
                });
                const ids = allCustomerIds.map(c => c.id);
                return next(new ErrorHandler(`Mijoz topilmadi. Mavjud mijoz IDlar: ${ids.join(", ")}`, 404));
            }

            const updatedCustomer = await prisma.user.update({
                where: { id: parseInt(id) },
                data: { firstName, lastName, username: username?.trim(), email },
            });

            res.status(200).json({
                message: "Mijoz muvaffaqiyatli yangilandi.",
                customer: updatedCustomer,
            });
        } catch (error) {
            handleError(error, next, "Mijozni yangilashda xatolik");
        }
    }

    static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
        if (!isAdmin(req)) {
            return next(new ErrorHandler("Sizda mijozni o'chirish uchun ruxsat yo'q", 403));
        }

        const { id } = req.params;

        try {
            const customer = await prisma.user.findUnique({
                where: { id: parseInt(id) },
            });

            if (!customer || customer.role !== "CUSTOMER") {
                const allCustomerIds = await prisma.user.findMany({
                    where: { role: "CUSTOMER" }, 
                    select: { id: true }
                });
                const ids = allCustomerIds.map(c => c.id);
                return next(new ErrorHandler(`Mijoz topilmadi. Mavjud mijoz IDlar: ${ids.join(", ")}`, 404));
            }

            await prisma.user.delete({
                where: { id: parseInt(id) } 
            });

            res.status(200).json({
                message: "Mijoz muvaffaqiyatli o'chirildi.",
            });
        } catch (error) {
            handleError(error, next, "Mijozni o'chirishda xatolik");
        }
    }
}
