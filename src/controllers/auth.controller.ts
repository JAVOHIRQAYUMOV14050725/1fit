import { ErrorHandlerMiddleware } from "@middlewares";
import { PrismaClient } from "@prisma/client";
import { access_token, new_refresh_token, refresh_token } from "@utils"; 
import { NextFunction, Request, Response } from "express";
import { verify, sign } from "jsonwebtoken";
import passport from "passport";

const prisma = new PrismaClient();

export class AuthController {
    static async AuthenticationGithub(req: Request, res: Response, next: NextFunction) {
        try {
            passport.authenticate("github", {
                scope: ["user:email"]
            })(req, res, (error: any) => {
                if (error) return next(error);
                res.redirect('/some-redirect-url'); 
            });
        } catch (error) {
            next(error);
        }
    }
    
    static async CallbackGithub(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, username, _json } = req.user as any;
            const existingUser = await prisma.user.findFirst({
                where: { user_github_platform_id: id }
            });

            const generateTokens = async (userId: number) => {
                const accessToken = access_token(userId); 
                const refreshToken = refresh_token(userId); 
                await prisma.user.update({
                    where: { id: userId },
                    data: { access_token: accessToken, refresh_token: refreshToken }
                });

                return { accessToken, refreshToken };
            };

            let tokens;

            if (existingUser) {
                tokens = await generateTokens(existingUser.id);
                res.status(200).send({
                    success: true,
                    message: "You have entered successfully",
                    data: {
                        access_token: tokens.accessToken,
                        refresh_token: tokens.refreshToken,
                        expireIn: "120 seconds"
                    }
                });
            } else {
                const uzbDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tashkent" }));

                const newUser = await prisma.user.create({
                    data: {
                        user_github_platform_id: id,
                        username,
                        email: _json.email,
                        firstName: _json.firstName, // 'firsName' to'g'rilandi
                        lastName: _json.lastName,
                        createdAt: uzbDate, 
                        updatedAt: uzbDate, 
                        access_token: "", 
                        refresh_token: "" 
                    }
                });

                tokens = await generateTokens(newUser.id);
                res.status(201).send({
                    success: true,
                    message: "You have successfully registered",
                    data: {
                        access_token: tokens.accessToken,
                        refresh_token: tokens.refreshToken,
                        expireIn: "120 seconds"
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }

    static async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).send({
                success: false,
                message: "Refresh token mavjud emas"
            });
        }

        const user = await prisma.user.findFirst({
            where: { refresh_token: refreshToken }
        });

        if (!user) {
            return res.status(403).send({
                success: false,
                message: "Refresh token topilmadi"
            });
        }

        let decoded: any;
        try {
            decoded = verify(refreshToken, process.env.MY_SECRET_KEY as string);
        } catch (error) {
            return res.status(403).send({
                success: false,
                message: "Refresh token noto'g'ri"
            });
        }

        const newAccessToken = sign({ id: decoded.id }, process.env.MY_SECRET_KEY as string, { expiresIn: "2h" });

        await prisma.user.update({
            where: { id: user.id },
            data: { access_token: newAccessToken }
        });

        res.status(200).send({
            success: true,
            access_token: newAccessToken,
        });
    }


    static async newRefreshAccessToken(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).send({
                success: false,
                message: "Refresh token mavjud emas"
            });
        }

        const user = await prisma.user.findFirst({
            where: { refresh_token: refreshToken }
        });

        if (!user) {
            return res.status(403).send({
                success: false,
                message: "Refresh token topilmadi"
            });
        }

        let decoded: any;
        try {
            decoded = verify(refreshToken, process.env.MY_SECRET_KEY as string);
        } catch (error) {
            return res.status(403).send({
                success: false,
                message: "Refresh token noto'g'ri"
            });
        }

        const newAccessToken = access_token(decoded.id);
        const newRefreshToken = new_refresh_token(decoded.id); 

        await prisma.user.update({
            where: { id: user.id },
            data: { access_token: newAccessToken, refresh_token: newRefreshToken }
        });

        res.status(200).send({
            success: true,
            access_token: newAccessToken,
            refresh_token: newRefreshToken, 
        });
    }

}
