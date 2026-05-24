import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.upsert({
    where:  { name: "SUPER_PROCTOR" },
    create: { name: "SUPER_PROCTOR" },
    update: {},
  });
  console.log("✓ Role seeded:", role.name);
}

main()
  .catch((e) => { console.error("Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
