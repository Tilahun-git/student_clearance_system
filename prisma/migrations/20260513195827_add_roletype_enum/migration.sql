-- CreateEnum (safe: only creates if not exists)
DO $$ BEGIN
  CREATE TYPE "RoleType" AS ENUM (
    'STUDENT',
    'ADVISOR',
    'DEPARTMENT_HEAD',
    'SCHOOL_DEAN',
    'FINANCE',
    'LIBRARY',
    'REGISTRAR',
    'ADMIN',
    'CAFETERIA',
    'DORMITORY',
    'STUDENT_DEAN',
    'CAMPUS_POLICE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable: cast existing VARCHAR values to the new enum using USING clause
-- This preserves all existing data in the Role table
ALTER TABLE "Role"
  ALTER COLUMN "name" TYPE "RoleType"
  USING "name"::"RoleType";

-- CreateIndex (safe: only creates if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");
