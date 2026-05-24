import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  const certificates = await prisma.clearanceCertificate.findMany({
      include: {
        student: {
          include: {
            department: true,
          },
        },
        request: true,
      },
      orderBy: {
        issuedAt: "desc",
      },
    });
  return NextResponse.json(
    certificates
  );
}