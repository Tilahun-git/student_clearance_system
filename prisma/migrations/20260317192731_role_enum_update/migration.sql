/*
  Warnings:

  - The values [DORMITORY,CAFETERIA,ICT,SECURITY] on the enum `RoleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `advisorStatus` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `deptStatus` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `financeStatus` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `libraryStatus` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `program` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `registrarStatus` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `headId` on the `Department` table. All the data in the column will be lost.
  - Made the column `reason` on table `ClearanceRequest` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `schoolId` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `program` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClearanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "RoleType_new" AS ENUM ('STUDENT', 'ADVISOR', 'DEPARTMENT_HEAD', 'FINANCE', 'LIBRARY', 'REGISTRAR', 'ADMIN');
ALTER TABLE "Role" ALTER COLUMN "name" TYPE "RoleType_new" USING ("name"::text::"RoleType_new");
ALTER TYPE "RoleType" RENAME TO "RoleType_old";
ALTER TYPE "RoleType_new" RENAME TO "RoleType";
DROP TYPE "public"."RoleType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_headId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_advisorId_fkey";

-- AlterTable
ALTER TABLE "ClearanceRequest" DROP COLUMN "advisorStatus",
DROP COLUMN "department",
DROP COLUMN "deptStatus",
DROP COLUMN "financeStatus",
DROP COLUMN "libraryStatus",
DROP COLUMN "program",
DROP COLUMN "registrarStatus",
DROP COLUMN "school",
ADD COLUMN     "status" "ClearanceStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "reason" SET NOT NULL;

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "headId",
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "name",
ADD COLUMN     "name" "RoleType" NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "program" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facultyId" TEXT,
    "schoolId" TEXT,
    "departmentId" TEXT,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClearanceApproval" (
    "id" TEXT NOT NULL,
    "clearanceRequestId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "staffId" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "ClearanceApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceApproval" ADD CONSTRAINT "ClearanceApproval_clearanceRequestId_fkey" FOREIGN KEY ("clearanceRequestId") REFERENCES "ClearanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceApproval" ADD CONSTRAINT "ClearanceApproval_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceApproval" ADD CONSTRAINT "ClearanceApproval_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
