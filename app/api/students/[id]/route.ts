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