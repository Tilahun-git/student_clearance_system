-- AlterTable
ALTER TABLE "ClearanceRequest" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "facultyId" TEXT,
ADD COLUMN     "schoolId" TEXT;

-- AddForeignKey
ALTER TABLE "ClearanceRequest" ADD CONSTRAINT "ClearanceRequest_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceRequest" ADD CONSTRAINT "ClearanceRequest_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceRequest" ADD CONSTRAINT "ClearanceRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
