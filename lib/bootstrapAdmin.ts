import { RoleType } from "@prisma/client";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function bootstrapAdmin() {
  try {
    let adminRole = await prisma.role.findUnique({
      where: { name: "ADMIN" as any },
    });
    if (!adminRole) {
      adminRole = await prisma.role.create({ data: { name: RoleType.ADMIN } });
    }
    const adminUser = await prisma.user.findFirst({
      where: { roles: { some: { roleId: adminRole.id } } },
    });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const user = await prisma.user.create({
        data: {
          name: "System Admin",
          email: "admin@system.com",
          password: hashedPassword,
          roles: { create: { roleId: adminRole.id } },
        },
      });
      console.log("ADMIN user created:", user.email);
    }
  } catch (error) {
    console.error("BOOTSTRAP ADMIN ERROR:", error);
  }
}
