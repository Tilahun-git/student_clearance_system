import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

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
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
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