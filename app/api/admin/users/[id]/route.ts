import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLE_TYPES } from "@/lib/roles";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

// ... helpers unchanged
const OFFICE_ROLE_NAMES = new Set<string>([
  RoleType.CAFETERIA,
  RoleType.CAMPUS_POLICE,
  RoleType.LIBRARY,
  RoleType.DORMITORY,
  RoleType.STUDENT_DEAN,
  RoleType.REGISTRAR,
]);

type Params = { params: Promise<{ id: string }> };

async function clearRoleAssignmentsForStaff(staffId: string, roleName: string) {
  const updates = [];

  if (roleName === RoleType.DEPARTMENT_HEAD) {
    updates.push(
      prisma.department.updateMany({
        where: { headId: staffId },
        data: { headId: null },
      }),
    );
  }

  if (roleName === RoleType.SCHOOL_DEAN) {
    updates.push(
      prisma.school.updateMany({
        where: { school_deanId: staffId },
        data: { school_deanId: null },
      }),
    );
  }

  if (OFFICE_ROLE_NAMES.has(roleName)) {
    updates.push(
      prisma.clearanceStaffOffice.updateMany({
        where: { managerId: staffId },
        data: { managerId: null },
      }),
    );
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
}

async function clearAllStaffAssignments(staffId: string) {
  await prisma.$transaction([
    prisma.department.updateMany({
      where: { headId: staffId },
      data: { headId: null },
    }),
    prisma.school.updateMany({
      where: { school_deanId: staffId },
      data: { school_deanId: null },
    }),
    prisma.clearanceStaffOffice.updateMany({
      where: { managerId: staffId },
      data: { managerId: null },
    }),
  ]);
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, role } = body as {
      action: "activate" | "deactivate" | "grant_role" | "revoke_role";
      role?: string;
    };
    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }
    if (action === "activate" || action === "deactivate") {
      const staff = await prisma.staff.findUnique({
        where: { userId: id },
        select: { id: true },
      });

      if (action === "deactivate" && staff) {
        await clearAllStaffAssignments(staff.id);
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { isActive: action === "activate" },
        select: { id: true, isActive: true },
      });
      return NextResponse.json(updated);
    }
    if (action === "grant_role" || action === "revoke_role") {
      if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 });
      const normalizedRole = role.toUpperCase().trim();
      if (!ROLE_TYPES.includes(normalizedRole as RoleType)) {
        return NextResponse.json({ error: `Invalid role: ${normalizedRole}` }, { status: 400 });
      }
      const roleRecord = await prisma.role.findUnique({ where: { name: normalizedRole as RoleType } });
      if (!roleRecord) {
        return NextResponse.json({ error: `Role "${normalizedRole}" not seeded` }, { status: 404 });
      }
      if (action === "grant_role") {
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: id, roleId: roleRecord.id } },
          create: { userId: id, roleId: roleRecord.id },
          update: {},
        });
        if (normalizedRole !== RoleType.STUDENT) {
          await prisma.staff.upsert({ where: { userId: id }, create: { userId: id }, update: {} });
        }
      } else {
        if (normalizedRole === RoleType.ADMIN) {
          const adminCount = await prisma.userRole.count({
            where: { role: { name: RoleType.ADMIN } },
          });
          if (adminCount <= 1) {
            return NextResponse.json(
              { error: "Cannot revoke the last admin role. The system must always have at least one admin." },
              { status: 409 },
            );
          }
        }

        const staff = await prisma.staff.findUnique({
          where: { userId: id },
          select: { id: true },
        });

        if (staff) {
          await clearRoleAssignmentsForStaff(staff.id, normalizedRole);
        }

        await prisma.userRole
          .delete({ where: { userId_roleId: { userId: id, roleId: roleRecord.id } } })
          .catch(() => {});
      }
      const updated = await prisma.user.findUnique({
        where: { id },
        select: { id: true, roles: { include: { role: true } } },
      });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("USER_PATCH_ERROR", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// soft delete (sets isActive=false, keeps data)
export async function DELETE(req: Request, { params }: Params) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const staff = await prisma.staff.findUnique({
      where: { userId: id },
      select: { id: true },
    });

    if (staff) {
      await clearAllStaffAssignments(staff.id);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ message: "User deactivated" });
  } catch (error) {
    console.error("USER_DELETE_ERROR", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
