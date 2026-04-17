/*
  Warnings:

  - A unique constraint covering the columns `[headId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deanId]` on the table `School` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "headId" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "deanId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Department_headId_key" ON "Department"("headId");

-- CreateIndex
CREATE UNIQUE INDEX "School_deanId_key" ON "School"("deanId");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_deanId_fkey" FOREIGN KEY ("deanId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
