import { prisma } from "@/lib/prisma";

export async function GET() {
  const students = await prisma.student.findMany({
    include: {
      department: true,
    },
    orderBy: {
      firstName: "desc",
    },
  });

  return Response.json(students);
}