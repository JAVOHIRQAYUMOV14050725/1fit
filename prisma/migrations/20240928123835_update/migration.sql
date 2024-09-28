/*
  Warnings:

  - A unique constraint covering the columns `[gym_id,sport_id]` on the table `GymSport` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,gym_id]` on the table `GymUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,sport_id]` on the table `SportUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GymSport_gym_id_sport_id_key" ON "GymSport"("gym_id", "sport_id");

-- CreateIndex
CREATE UNIQUE INDEX "GymUser_user_id_gym_id_key" ON "GymUser"("user_id", "gym_id");

-- CreateIndex
CREATE UNIQUE INDEX "SportUser_user_id_sport_id_key" ON "SportUser"("user_id", "sport_id");
