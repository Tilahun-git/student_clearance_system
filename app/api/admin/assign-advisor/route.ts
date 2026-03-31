import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { studentId, advisorId } = await req.json();

    if (!studentId || !advisorId) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { studentId },
      select: { advisorId: true },
    });

    if (!student) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.advisorId !== null) {
      return Response.json(
        { error: "Student already has an advisor" },
        { status: 409 }
      );
    }

    await prisma.student.update({
      where: { studentId },
      data: { advisorId },
    });

    return Response.json({ message: "Advisor assigned successfully" });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}