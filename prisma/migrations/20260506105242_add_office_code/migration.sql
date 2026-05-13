/*
  Warnings:

  - You are about to drop the column `deanId` on the `School` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[faculty_deanId]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[school_deanId]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `faculty_deanId` to the `Faculty` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_deanId_fkey";

-- DropIndex
DROP INDEX "School_deanId_key";

-- AlterTable
ALTER TABLE "ClearanceApproval" ADD COLUMN     "officeId" TEXT;

-- AlterTable
ALTER TABLE "ClearanceRequest" ADD COLUMN     "officeId" TEXT;

-- AlterTable
ALTER TABLE "Faculty" ADD COLUMN     "faculty_deanId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "School" DROP COLUMN "deanId",
ADD COLUMN     "school_deanId" TEXT;

-- CreateTable
CREATE TABLE "ClearanceStaffOffice" (
    "id" TEXT NOT NULL,
    "office_name" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "ClearanceStaffOffice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClearanceStaffOffice_code_key" ON "ClearanceStaffOffice"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_faculty_deanId_key" ON "Faculty"("faculty_deanId");

-- CreateIndex
CREATE UNIQUE INDEX "School_school_deanId_key" ON "School"("school_deanId");

-- AddForeignKey
ALTER TABLE "ClearanceStaffOffice" ADD CONSTRAINT "ClearanceStaffOffice_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_faculty_deanId_fkey" FOREIGN KEY ("faculty_deanId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_school_deanId_fkey" FOREIGN KEY ("school_deanId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceRequest" ADD CONSTRAINT "ClearanceRequest_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "ClearanceStaffOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceApproval" ADD CONSTRAINT "ClearanceApproval_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "ClearanceStaffOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
