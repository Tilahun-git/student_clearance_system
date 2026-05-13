import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const offices = await prisma.clearanceStaffOffice.findMany({
    include: {
      manager: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { office_name: "asc" },
  });

  return NextResponse.json(offices);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const office = await prisma.clearanceStaffOffice.create({
      data: {
        office_name: body.office_name,
        code: body.code,
        managerId: body.managerId || null,
      },
    });

    return NextResponse.json(office);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create office" },
      { status: 500 }
    );
  }
}