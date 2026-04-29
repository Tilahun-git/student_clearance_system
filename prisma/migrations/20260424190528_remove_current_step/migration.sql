/*
  Warnings:

  - You are about to drop the column `currentStep` on the `ClearanceRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clearanceRequestId,roleId]` on the table `ClearanceApproval` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ClearanceRequest" DROP COLUMN "currentStep";

-- CreateIndex
CREATE UNIQUE INDEX "ClearanceApproval_clearanceRequestId_roleId_key" ON "ClearanceApproval"("clearanceRequestId", "roleId");
