import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    const normalizedName = name.toUpperCase().trim();

    const existing = await prisma.role.findUnique({
      where: { name: normalizedName },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Role already exists" },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name: normalizedName,
      },
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

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    });

    console.log("fetched roles to register are : ",roles)
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
} 