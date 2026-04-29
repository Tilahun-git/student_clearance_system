import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, roles } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ================= HASH PASSWORD =================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= DEFAULT ROLE =================
    const selectedRoles: string[] =
      Array.isArray(roles) && roles.length > 0
        ? roles
        : ["STUDENT"];

    console.log("ROLES FROM FRONTEND:", selectedRoles);

    // ================= FETCH ROLES =================
    const roleRecords = await prisma.role.findMany({
      where: {
        name: { in: selectedRoles },
      },
    });

    if (roleRecords.length !== selectedRoles.length) {
      return NextResponse.json(
        { error: "One or more roles are invalid or not seeded in DB" },
        { status: 400 }
      );
    }

    // ================= CREATE USER + ROLES =================
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
          include: { role: true },
        },
      },
    });

    // ================= DETECT NON-STUDENT =================
    const isStaff = roleRecords.some(
      (r) => r.name !== "STUDENT"
    );

    console.log("IS STAFF:", isStaff);

    // ================= CREATE STAFF IF NEEDED =================
    if (isStaff) {
      const existingStaff = await prisma.staff.findUnique({
        where: { userId: user.id },
      });

      if (!existingStaff) {
        await prisma.staff.create({
          data: {
            userId: user.id,
          },
        });
      }
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