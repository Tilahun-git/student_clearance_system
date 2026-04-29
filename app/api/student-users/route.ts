import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: "STUDENT",
            },
          },
        },
        studentProfile: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
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