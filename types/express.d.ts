import { PrismaClient, Role } from "@prisma/client";

declare global {
  namespace Express {
    interface AdminGym {
      gymId: number; 
     
    }

    interface User {
      id: number;
      role: Role;
      username: string | null; 
      email: string | null;
      access_token?: string | null;
      refresh_token?: string | null;
      createdAt?: Date | null;
      updatedAt?: Date | null;
      adminGym?: AdminGym[]; 
    }

    interface Request {
      user?: User; 
    }
  }
}

const prisma = new PrismaClient();
