
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const roleNames =
      user?.roles.map((r) => r.role.name) || [];

    if (!roleNames.includes("ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const offices = await prisma.clearanceStaffOffice.findMany({
      include: {
        manager: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        office_name: "asc",
      },
    });

    return NextResponse.json(offices);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const roleNames =
      user?.roles.map((r) => r.role.name) || [];

    if (!roleNames.includes("ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const {
      office_name,
      code,
      managerId,
    } = await req.json();

    if (!office_name || !code) {
      return NextResponse.json(
        { error: "Office name and code required" },
        { status: 400 }
      );
    }

    const existing =
      await prisma.clearanceStaffOffice.findUnique({
        where: {
          code,
        },
      });

    if (existing) {
      return NextResponse.json(
        { error: "Office code already exists" },
        { status: 400 }
      );
    }

    const office =
      await prisma.clearanceStaffOffice.create({
        data: {
          office_name,
          code,
          managerId,
        },
      });

    return NextResponse.json(office);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
