import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Reasons } from "@/lib/constants/reasons";

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      include: { departments: true },
      orderBy: { name: "asc" },
    });

    const departments = schools.flatMap((s) => s.departments);



    return NextResponse.json({ schools, departments, Reasons });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load clearance data" }, { status: 500 });
  }
}
