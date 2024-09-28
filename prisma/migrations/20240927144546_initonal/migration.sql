/*
  Warnings:

  - A unique constraint covering the columns `[user_github_platform_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_github_platform_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_github_platform_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_user_github_platform_id_key" ON "User"("user_github_platform_id");
