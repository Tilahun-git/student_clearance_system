/*
  Warnings:

  - You are about to drop the column `officeId` on the `ClearanceRequest` table. All the data in the column will be lost.
  - Made the column `section` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ClearanceRequest" DROP CONSTRAINT "ClearanceRequest_officeId_fkey";

-- AlterTable
ALTER TABLE "ClearanceRequest" DROP COLUMN "officeId";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "section" SET NOT NULL,
ALTER COLUMN "section" SET DEFAULT 'A';
