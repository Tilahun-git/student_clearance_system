import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {

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