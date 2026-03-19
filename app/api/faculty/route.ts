import { prisma } from "@/lib/prisma";

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

    return Response.json(faculties);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch faculties" },
      { status: 500 }
    );
  }
}