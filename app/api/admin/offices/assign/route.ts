import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { officeId, managerId } = await req.json();

  const office = await prisma.clearanceStaffOffice.update({
    where: { id: officeId },
    data: {
      managerId,
    },
  });

  return NextResponse.json(office);
}