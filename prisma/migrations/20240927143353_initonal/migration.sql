-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "password" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gym" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymSport" (
    "id" SERIAL NOT NULL,
    "gym_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,

    CONSTRAINT "GymSport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GymSport" ADD CONSTRAINT "GymSport_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSport" ADD CONSTRAINT "GymSport_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
