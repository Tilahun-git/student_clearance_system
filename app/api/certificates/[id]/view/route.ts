import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const cert = await prisma.clearanceCertificate.findUnique({
    where: { id: params.id },
  });

  if (!cert) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await fetch(cert.fileUrl);
  const buffer = await file.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=certificate.pdf",
    },
  });
}