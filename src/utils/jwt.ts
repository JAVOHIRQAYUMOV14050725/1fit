import dotenv from 'dotenv';
import { sign } from "jsonwebtoken";

dotenv.config();

export const access_token = (userId: number): string => {
    if (!process.env.MY_SECRET_KEY) {
        throw new Error("Secret key aniqlanmadi");
    }

    return sign({ id: userId }, process.env.MY_SECRET_KEY, {
        expiresIn: '1h' 
    });
};

export const refresh_token = (userId: number): string => {
    if (!process.env.MY_SECRET_KEY) {
        throw new Error("Secret key aniqlanmadi");
    }

    return sign({ id: userId }, process.env.MY_SECRET_KEY,{
        expiresIn: "5h"
    });
};

export const new_refresh_token = (userId: number): string => {
    if (!process.env.MY_SECRET_KEY) {
        throw new Error("Secret key aniqlanmadi");
    }

    return sign({ id: userId }, process.env.MY_SECRET_KEY, {
        expiresIn: '20h'
    });
};

