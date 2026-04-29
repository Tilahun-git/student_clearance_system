import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

// ================= CREATE ROLE =================
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    // validate against enum (important)
    if (!Object.values(RoleType).includes(name)) {
      return NextResponse.json(
        { error: "Invalid role type" },
        { status: 400 }
      );
    }

    const existing = await prisma.role.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Role already exists" },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: { name },
    });

    return NextResponse.json(role, { status: 201 });

  } catch (error) {
    console.error("CREATE ROLE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}


// ================= GET ROLES =================
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(roles);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}