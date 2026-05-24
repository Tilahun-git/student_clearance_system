import dotenv from "dotenv";

dotenv.config({ path: ".env" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding roles...");

  const roles = [
    "STUDENT",
    "ADVISOR",
    "DEPARTMENT_HEAD",
    "CAMPUS_POLICE",
    "LIBRARY",
    "REGISTRAR",
    "ADMIN",
    "SCHOOL_DEAN",
    "CAFETERIA",
    "DORMITORY",
    "STUDENT_DEAN",
    "SUPER_PROCTOR"
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role }
    });
  }

  console.log("Roles seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());