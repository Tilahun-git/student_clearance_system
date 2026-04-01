import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { RoleType, ClearanceStatus } from "@prisma/client";



export async function POST(req: Request) {
  try {


    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles?.includes(RoleType.STUDENT)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const student = await prisma.student.findUnique({
      where: { studentId: body.studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
    }

    console.log("the request is : ",body)

    console.log("the student is : ",student)



    if (body.studentId && body.studentId !== student.studentId) {

      return NextResponse.json({ error: "Student ID mismatch occurred " }, { status: 400 });
    }

    console.log("the request student ID is : ",body.studentId)
    console.log("the fetched student ID is : ",student.studentId)

    const existing = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        status: { not: ClearanceStatus.APPROVED },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have an active request" },
        { status: 400 }
      );
    }
const dbRoles = await prisma.role.findMany({
  where: {
    name: {
      in: [
        RoleType.ADVISOR,
        RoleType.DEPARTMENT_HEAD,
        RoleType.SCHOOL_DEAN,
        RoleType.LIBRARY,
        RoleType.FINANCE,
        RoleType.REGISTRAR,
      ],
    },
  },
});

   const clearance = await prisma.clearanceRequest.create({
    data: {
    studentId: student.id,
    facultyId: body.facultyId,
    schoolId: body.schoolId,
    departmentId: body.departmentId,
    reason: body.reason,
    academicYear: body.academicYear,
    semester: body.semester,

    currentStep: RoleType.ADVISOR,

approvals: {
  create: dbRoles.map((role) => ({
    role: {
      connect: {
        id: role.id, 
      },
    },
  })),
},
  },
});

console.log("the role is : ",RoleType.ADVISOR)

console.log("The created clearance request is :",clearance)

    return NextResponse.json(clearance, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed, unable to create clearance request" }, { status: 500 });
  }
}