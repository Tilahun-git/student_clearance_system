import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { officeId, staffId } = await req.json();

    if (!officeId || !staffId) {
      return NextResponse.json({ error: "officeId and staffId are required" }, { status: 400 });
    }

    const [office, staff] = await Promise.all([
      prisma.clearanceStaffOffice.findUnique({ where: { id: officeId } }),
      prisma.staff.findUnique({
        where: { id: staffId },
        include: { user: { include: { roles: { include: { role: true } } } } },
      }),
    ]);

    if (!office) return NextResponse.json({ error: "Office not found" }, { status: 404 });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const userRoles = staff.user.roles.map((r) => r.role.name as RoleType);
    if (!userRoles.includes(office.code.toUpperCase() as RoleType)) {
      return NextResponse.json(
        { error: "Staff does not have the required role for this office" },
        { status: 400 },
      );
    }

    const updated = await prisma.clearanceStaffOffice.update({
      where: { id: officeId },
      data: { managerId: staffId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("ASSIGN MANAGER ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
