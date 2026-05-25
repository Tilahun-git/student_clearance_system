import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLE_TYPES } from "@/lib/roles";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/apiAuth";
import { RoleType } from "@prisma/client";

async function syncStaffRoleAssignments({staffId, selectedRoles, schoolId, departmentId,}: {
  staffId: string;
  selectedRoles: string[];
  schoolId?: string;
  departmentId?: string;
}) {
  const hasDepartmentHead = selectedRoles.includes(RoleType.DEPARTMENT_HEAD);
  const hasSchoolDean = selectedRoles.includes(RoleType.SCHOOL_DEAN);
  if (hasDepartmentHead && departmentId) {
    await prisma.department.updateMany({
      where: { headId: staffId },
      data: { headId: null },
    });
    await prisma.department.update({
      where: { id: departmentId },
      data: { headId: staffId },
    });
  } else {
    await prisma.department.updateMany({
      where: { headId: staffId },
      data: { headId: null },
    });
  }

  if (hasSchoolDean && schoolId) {
    await prisma.school.updateMany({
      where: { school_deanId: staffId },
      data: { school_deanId: null },
    });

    await prisma.school.update({
      where: { id: schoolId },
      data: { school_deanId: staffId },
    });
  } else {
    await prisma.school.updateMany({
      where: { school_deanId: staffId },
      data: { school_deanId: null },
    });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const { name, email, password, roles, schoolId, departmentId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
        mustChangePassword: true, 
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

    const isSuperProctor = selectedRoles.includes("SUPER_PROCTOR");
    const isDormitory    = selectedRoles.includes("DORMITORY");
    const isStaff        = selectedRoles.some((r) => r !== "STUDENT" && r !== "SUPER_PROCTOR");

    if (isSuperProctor) {
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] ?? name;
      const lastName  = nameParts.slice(1).join(" ") || firstName;
      await prisma.proctor.upsert({
        where: { userId: user.id },
        create: {
          userId:        user.id,
          firstName,
          lastName,
          email,
          isSuperProctor: true,
        },
        update: {},
      });
    }

    // DORMITORY → create Proctor record (isSuperProctor: false) — these are the assignable proctors
    if (isDormitory && !isSuperProctor) {
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] ?? name;
      const lastName  = nameParts.slice(1).join(" ") || firstName;
      await prisma.proctor.upsert({
        where: { userId: user.id },
        create: {
          userId:        user.id,
          firstName,
          lastName,
          email,
          isSuperProctor: false,
        },
        update: {},
      });
    }
    if (isStaff) {
      const staff = await prisma.staff.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          schoolId: schoolId || null,
          departmentId: departmentId || null,
        },
        update: {
          ...(schoolId && { schoolId }),
          ...(departmentId && { departmentId }),
        },
      });

      await syncStaffRoleAssignments({
        staffId: staff.id,
        selectedRoles,
        schoolId,
        departmentId,
      });
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
