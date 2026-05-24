-- AlterEnum
ALTER TYPE "RoleType" ADD VALUE 'SUPER_PROCTOR';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "proctorId" TEXT;

-- CreateTable
CREATE TABLE "Proctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "email" TEXT NOT NULL,
    "blockNumber" INTEGER,
    "isSuperProctor" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Proctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proctor_userId_key" ON "Proctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Proctor_email_key" ON "Proctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Proctor_blockNumber_key" ON "Proctor"("blockNumber");

-- AddForeignKey
ALTER TABLE "Proctor" ADD CONSTRAINT "Proctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_proctorId_fkey" FOREIGN KEY ("proctorId") REFERENCES "Proctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
