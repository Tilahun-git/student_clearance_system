import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: RoleType.STUDENT,
            },
          },
        },
        studentProfile: null, 
      },
    });

    return Response.json(users);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}