import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {

  try {

        const { id } = await params;
    const student = await prisma.student.findUnique({
      where: {
        studentId: id, 
      },
      include: {
        department: true,
      },
    });

    if (!student) {
      return Response.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return Response.json(student);
  } catch (error) {
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server"
// import { students } from "@/data/students"

// export async function GET(
//   req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params

//   const student = students.find(s => s.id === id)

//   if (!student) {
//     return NextResponse.json(
//       { error: "Student not found" },
//       { status: 404 }
//     )
//   }

//   return NextResponse.json(student)
//}