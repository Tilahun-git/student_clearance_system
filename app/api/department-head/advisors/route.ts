import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Fetch all advisors endpoint GET function

export async function GET() {
  try {
    const advisors =
      await prisma.staff.findMany({
        where: {
          user: {
            roles: {
              some: {
                role: {
                  name: "ADVISOR",
                },
              },
            },
          },
        },
        include: {
          user: true,
        },});
    return NextResponse.json({
      success: true,
      data: advisors,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch advisors",},
      { status: 500,}
    );}}

// Assign advisor endpoint POST function

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentIds,
      advisorId,
    } = body;
    if ( !studentIds?.length ||  !advisorId) {
      return NextResponse.json(
        { error: "Missing required fields",},
        { status: 400,}
      );}
    const advisor =await prisma.staff.findUnique({
        where: {
          id: advisorId,
        },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

    if (!advisor) {
      return NextResponse.json(
        { error: "Advisor not found",},
        { status: 404,}
      );}
    const hasAdvisorRole =
      advisor.user.roles.some(
        (r) =>  r.role.name === "ADVISOR" );
    if (!hasAdvisorRole) {
      return NextResponse.json(
        { error: "Selected staff is not advisor",},
        { status: 400, }
      );}
 await prisma.student.updateMany({
      where: {
        studentId: {
          in: studentIds,
        },
      },
      data: {
        advisorId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Advisor assigned successfully",
    });

  } catch (error: any) {
    console.error( "ASSIGN ADVISOR ERROR:", error );
    return NextResponse.json(
      { error:error.message || "Server error",},
      { status: 500,}
    );}
}