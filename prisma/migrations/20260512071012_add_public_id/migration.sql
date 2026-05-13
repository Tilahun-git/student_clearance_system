/*
  Warnings:

  - Added the required column `publicId` to the `ClearanceCertificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClearanceCertificate" ADD COLUMN     "publicId" TEXT NOT NULL;
