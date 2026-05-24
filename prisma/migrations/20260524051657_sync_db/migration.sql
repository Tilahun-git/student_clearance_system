/*
  Warnings:

  - You are about to drop the column `facultyId` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Faculty` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClearanceRequest" DROP CONSTRAINT "ClearanceRequest_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "Faculty" DROP CONSTRAINT "Faculty_faculty_deanId_fkey";

-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_facultyId_fkey";

-- AlterTable
ALTER TABLE "ClearanceRequest" DROP COLUMN "facultyId";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "forRole" TEXT;

-- AlterTable
ALTER TABLE "School" DROP COLUMN "facultyId";

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "facultyId";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "facultyId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Faculty";

-- CreateTable
CREATE TABLE "LibraryBorrow" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryBorrow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LibraryBorrow" ADD CONSTRAINT "LibraryBorrow_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBorrow" ADD CONSTRAINT "LibraryBorrow_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
