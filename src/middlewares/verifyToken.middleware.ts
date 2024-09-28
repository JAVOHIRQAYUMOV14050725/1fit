
import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { ErrorHandler } from "@errors";

dotenv.config();

const prisma = new PrismaClient();

const handleError = (error: unknown, next: NextFunction) => {    
    let message = "Iltimos, qayta urinib ko'ring";
    let status = 500;

    if (error instanceof TokenExpiredError) {
        message = "Tokenning muddati o'tgan";
        status = 403;
    } else if (error instanceof JsonWebTokenError) {
        message = "Token noto'g'ri";
        status = 403;
    } else if (error instanceof Error) {
        message = error.message;
    }

    return next(new ErrorHandler(message, status));
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.split(' ')[1] : null;

        if (!token) {
            return next(new ErrorHandler("Token mavjud emas", 401));
        }

        const data = verify(token, process.env.MY_SECRET_KEY as string) as { id: string };

        const userId = parseInt(data.id, 10);

        if (isNaN(userId)) {
            return next(new ErrorHandler("Foydalanuvchi ID xato", 400));
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return next(new ErrorHandler("Foydalanuvchi topilmadi", 404));
        }

        if (user.access_token && user.access_token !== token) {
            return next(new ErrorHandler("Token noto'g'ri", 403));
        }

        req.user = user; 
        next();
    } catch (error) {
        handleError(error, next);
    }
};
