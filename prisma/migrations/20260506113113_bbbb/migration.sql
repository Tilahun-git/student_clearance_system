-- DropForeignKey
ALTER TABLE "Faculty" DROP CONSTRAINT "Faculty_faculty_deanId_fkey";

-- AlterTable
ALTER TABLE "Faculty" ALTER COLUMN "faculty_deanId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_faculty_deanId_fkey" FOREIGN KEY ("faculty_deanId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
