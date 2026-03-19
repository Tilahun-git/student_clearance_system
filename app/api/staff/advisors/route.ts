import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function GET() {
  try {
    const advisors = await prisma.staff.findMany({
      where: {
        user: {
          roles: {
            some: {
              role: {
                name: RoleType.ADVISOR,
              },
            },
          },
        },
      },
      include: {
        user: true,
      },
    });

    return Response.json(advisors);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch advisors" },
      { status: 500 }
    );
  }
}