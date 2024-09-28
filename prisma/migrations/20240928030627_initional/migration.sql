-- CreateTable
CREATE TABLE "GymUser" (
    "id" SERIAL NOT NULL,
    "gym_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "GymUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportUser" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sport_id" INTEGER NOT NULL,

    CONSTRAINT "SportUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GymUser" ADD CONSTRAINT "GymUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymUser" ADD CONSTRAINT "GymUser_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportUser" ADD CONSTRAINT "SportUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportUser" ADD CONSTRAINT "SportUser_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
