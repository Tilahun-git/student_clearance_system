import { prisma } from "@/lib/prisma";

export async function GET() {
  const students = await prisma.student.findMany({
    include: {
      department: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  console.log("fetched students are : ",students)
  return Response.json(students);
}