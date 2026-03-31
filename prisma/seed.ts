import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

async function main() {
  const roles = Object.values(RoleType);

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  console.log(" Roles seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());