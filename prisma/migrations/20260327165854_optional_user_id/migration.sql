-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_advisorId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "advisorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
