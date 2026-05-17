import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RoleType } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  return user?.roles.map((r) => r.role.name).includes(RoleType.ADMIN) ?? false;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await requireAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { office_name, code, managerId } = await req.json();

    const office = await prisma.clearanceStaffOffice.update({
      where: { id },
      data: { office_name, code, managerId },
    });

    return NextResponse.json(office);
  } catch (error) {
    console.error("UPDATE OFFICE ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await requireAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.clearanceStaffOffice.delete({ where: { id } });
    return NextResponse.json({ message: "Office deleted" });
  } catch (error: any) {
    console.error("DELETE OFFICE ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to delete office" }, { status: 500 });
  }
}
