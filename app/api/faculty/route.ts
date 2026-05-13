import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const faculties =
      await prisma.faculty.findMany({

        select: {
          id: true,

          name: true,

          faculty_dean: {
            select: {
              id: true,

              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },

        orderBy: {
          name: "asc",
        },
      });

    return NextResponse.json(faculties);

  } catch (error) {

    console.error(
      "FACULTY_FETCH_ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch faculties",
      },
      {
        status: 500,
      }
    );
  }
}