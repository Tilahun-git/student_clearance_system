import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const cert = await prisma.clearanceCertificate.findUnique({
    where: { id },
  });

  if (!cert) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await fetch(cert.fileUrl);

  if (!file.ok) {
    return new NextResponse("Failed to fetch file", { status: 500 });
  }

  const buffer = await file.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=certificate.pdf",
    },
  });
}