import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLE_TYPES } from "@/lib/roles";
import { RoleType } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
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
        // ── Last-admin guard for preventing deletion of Admin role if only 1 admin exists
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
  try {
    const { id } = await params;
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
