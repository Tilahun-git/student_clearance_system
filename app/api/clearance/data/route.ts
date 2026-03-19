import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        schools: {
          include: {
            departments: true,
          },
        },
      },
    });
    const schools = faculties.flatMap(f => f.schools);
    const departments = schools.flatMap(s => s.departments);
    const reasons = [
      { id: "graduation", name: "Graduation" },
      { id: "withdrawal", name: "Withdrawal" },
      { id: "transfer", name: "Transfer" },
    ];

    return NextResponse.json({
      faculties,
      schools,
      departments,
      reasons,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load clearance data" },
      { status: 500 }
    );
  }
}