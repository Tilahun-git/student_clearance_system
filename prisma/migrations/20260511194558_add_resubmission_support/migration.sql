-- AlterTable
ALTER TABLE "ClearanceRequest" ADD COLUMN     "rejectedByRole" TEXT,
ADD COLUMN     "resubmissionCount" INTEGER NOT NULL DEFAULT 0;
