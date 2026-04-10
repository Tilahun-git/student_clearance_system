import { prisma } from "./prisma";
import { RoleType } from "@prisma/client";

import bcrypt from "bcrypt";


export async function bootstrapAdmin() {

  let adminRole = await prisma.role.findUnique({
    where: { name: RoleType.ADMIN },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: RoleType.ADMIN,
      },
    });
  }


  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.findFirst({
    where: {
      roles: {
        some: {
          roleId: adminRole.id,
        },
      },
    },
  });

  if (!adminUser) {
    const user = await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@system.com",
        password: hashedPassword,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });

    console.log("ADMIN user created:", user.email);
  } else {
    console.log("ADMIN has already created and exists");
  }
}