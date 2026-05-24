import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  const students = await prisma.student.findMany({
    include: {
      department: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return Response.json(students);
}