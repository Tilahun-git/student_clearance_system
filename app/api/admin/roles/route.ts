import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLE_TYPES } from "@/lib/roles";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

const VALID_ROLES = ROLE_TYPES;

export async function POST(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }
    const normalizedName = name.toUpperCase().trim();
    if (!VALID_ROLES.includes(normalizedName as RoleType)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 },
      );
    }

    const existing = await prisma.role.findUnique({ where: { name: normalizedName } });
    if (existing) {
      return NextResponse.json({ error: "Role already exists" }, { status: 400 });
    }

    const role = await prisma.role.create({ data: { name: normalizedName } });
    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("CREATE ROLE ERROR:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}
