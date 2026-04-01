import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, roles } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("ROLES FROM FRONTEND:", roles);

    const roleRecords = await prisma.role.findMany({
      where: {
        name: { in: roles },
      },
    });

    if (roleRecords.length !== roles.length) {
      return NextResponse.json(
        { error: "One or more roles are invalid or not seeded in DB" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,

        roles: {
          create: roleRecords.map((role) => ({
            roleId: role.id,
          })),
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const isStaff = roles.some((r: RoleType) => r !== RoleType.STUDENT);

    if (isStaff) {
      await prisma.staff.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}