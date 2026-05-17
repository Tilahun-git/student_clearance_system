import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLE_TYPES } from "@/lib/roles";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, roles, schoolId, departmentId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for existing account with this email (including soft-deleted/inactive ones)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const hint = existing.isActive
        ? "An active account with this email already exists."
        : "A deactivated account with this email already exists. Reactivate it from User Management instead of creating a new one.";
      return NextResponse.json({ error: hint }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const selectedRoles: string[] =
      Array.isArray(roles) && roles.length > 0
        ? roles.map((r: string) => r.toUpperCase().trim())
        : ["STUDENT"];

    const invalidRoles = selectedRoles.filter((r) => !ROLE_TYPES.includes(r as any));
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `Invalid roles: ${invalidRoles.join(", ")}` },
        { status: 400 },
      );
    }

    const roleRecords = await prisma.role.findMany({
      where: { name: { in: selectedRoles as any[] } },
    });

    if (roleRecords.length !== selectedRoles.length) {
      return NextResponse.json(
        { error: "One or more roles are not seeded in the database" },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mustChangePassword: true,   // force password change on first login
        roles: {
          create: roleRecords.map((role) => ({ roleId: role.id })),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        roles: { include: { role: true } },
      },
    });

    // Auto-create Staff record for any non-student user
    const isStaff = selectedRoles.some((r) => r !== "STUDENT");
    if (isStaff) {
      const existingStaff = await prisma.staff.findUnique({ where: { userId: user.id } });
      if (!existingStaff) {
        await prisma.staff.create({
          data: {
            userId: user.id,
            schoolId:     schoolId     || null,
            departmentId: departmentId || null,
          },
        });
      } else {
        // Update existing staff with school/dept if provided
        await prisma.staff.update({
          where: { userId: user.id },
          data: {
            ...(schoolId     && { schoolId }),
            ...(departmentId && { departmentId }),
          },
        });
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("CREATE USER ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 },
    );
  }
}
