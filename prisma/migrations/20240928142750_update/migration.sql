-- CreateTable
CREATE TABLE "AdminGym" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "gymId" INTEGER NOT NULL,

    CONSTRAINT "AdminGym_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminGym_adminId_gymId_key" ON "AdminGym"("adminId", "gymId");

-- AddForeignKey
ALTER TABLE "AdminGym" ADD CONSTRAINT "AdminGym_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminGym" ADD CONSTRAINT "AdminGym_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
