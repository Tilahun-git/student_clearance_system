-- DropForeignKey
ALTER TABLE "ClearanceStaffOffice" DROP CONSTRAINT "ClearanceStaffOffice_managerId_fkey";

-- AlterTable
ALTER TABLE "ClearanceStaffOffice" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ClearanceStaffOffice" ADD CONSTRAINT "ClearanceStaffOffice_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
