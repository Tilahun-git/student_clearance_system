import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { Reasons } from "@/lib/constants/reasons";
import fs from "fs/promises";
import path from "path";

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return rgb(r, g, b);
}

export async function generateCertificate(requestId: string) {
  
  console.log("========== CERTIFICATE GENERATION STARTED ==========");

  // ── 1. Fetch request with full student details 
  const request = await prisma.clearanceRequest.findUnique({
    where: { id: requestId },
    include: {
      student: {
        include: {
          department: true,
          school: true,
        },
      },
    },
  });

  if (!request) throw new Error("Request not found");

  // ── 2. Skip if certificate already exists (idempotent) 
  const existing = await prisma.clearanceCertificate.findUnique({
    where: { requestId },
  });
  if (existing) {
    console.log("Certificate already exists, returning existing record");
    return existing;
  }

  // ── 3. Resolve reason label 
  const reasonLabel =
    Reasons.find((r) => r.id === request.reason)?.name ||
    request.reason ||
    "Clearance";

  // ── 4. Build PDF 
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 20, y: 20,
    width: width - 40, height: height - 40,
    borderColor: hexToRgb("#4F46E5"),
    borderWidth: 2,
  });

  page.drawRectangle({
    x: 28, y: 28,
    width: width - 56, height: height - 56,
    borderColor: hexToRgb("#818CF8"),
    borderWidth: 0.5,
  });

  page.drawRectangle({
    x: 20, y: height - 130,
    width: width - 40, height: 110,
    color: hexToRgb("#4F46E5"),
  });

  try {
    const logoPath = path.join(process.cwd(), "public", "wldu_logo.jpg");
    const logoBytes = await fs.readFile(logoPath);
    const logo = await pdfDoc.embedJpg(logoBytes); 
    page.drawImage(logo, {
      x: 40,
      y: height - 120,
      width: 70,
      height: 70,
    });
  } catch (err) {
    console.log("Logo embed skipped:", err);
  }

  page.drawText("WOLDIA UNIVERSITY", {
    x: 125, y: height - 65,
    size: 18, font: boldFont,
    color: rgb(1, 1, 1),
  });

  page.drawText("Office of the Registrar", {
    x: 125, y: height - 85,
    size: 11, font,
    color: rgb(0.85, 0.85, 1),
  });

  page.drawText("Student Clearance Certificate", {
    x: 125, y: height - 105,
    size: 10, font,
    color: rgb(0.75, 0.75, 0.95),
  });

  // "VERIFIED" stamp
page.drawText("VERIFIED", {
  x: width - 130,
  y: height - 75,
  size: 14,
  font: boldFont,
  color: hexToRgb("#86EFAC"),
});

  // ── Certification statement 
  page.drawText("This is to certify that", {
    x: 50, y: height - 175,
    size: 12, font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(
    `${request.student.firstName} ${request.student.lastName}`,
    {
      x: 50, y: height - 205,
      size: 22, font: boldFont,
      color: hexToRgb("#1E1B4B"),
    }
  );

  page.drawText(
    "has successfully completed all university clearance requirements",
    {
      x: 50, y: height - 235,
      size: 11, font,
      color: rgb(0.35, 0.35, 0.35),
    }
  );

  page.drawText("and is hereby granted official clearance.", {
    x: 50, y: height - 252,
    size: 11, font,
    color: rgb(0.35, 0.35, 0.35),
  });

  // Divider
  page.drawLine({
    start: { x: 50, y: height - 270 },
    end: { x: width - 50, y: height - 270 },
    thickness: 0.5,
    color: hexToRgb("#C7D2FE"),
  });

  // ── Student details grid 
  const col1x = 50;
  const col2x = 310;
  let rowY = height - 300;
  const rowGap = 26;

  const leftDetails: [string, string][] = [
    ["Student ID", request.student.studentId],
    ["Program", request.student.program || "—"],
    ["Year", request.student.year ? `Year ${request.student.year}` : "—"],
    ["Section", request.student.section || "—"],
  ];

  const rightDetails: [string, string][] = [
    ["School", request.student.school?.name || "—"],
    ["Department", request.student.department?.name || "—"],
    ["Academic Year", request.academicYear || "—"],
  ];

  leftDetails.forEach(([label, value], i) => {
    page.drawText(`${label}:`, {
      x: col1x, y: rowY - i * rowGap,
      size: 10, font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(value, {
      x: col1x + 90, y: rowY - i * rowGap,
      size: 10, font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  rightDetails.forEach(([label, value], i) => {
    page.drawText(`${label}:`, {
      x: col2x, y: rowY - i * rowGap,
      size: 10, font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(value, {
      x: col2x + 90, y: rowY - i * rowGap,
      size: 10, font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  // Clearance details row
  const detailY = rowY - leftDetails.length * rowGap - 20;

  page.drawLine({
    start: { x: 50, y: detailY + 15 },
    end: { x: width - 50, y: detailY + 15 },
    thickness: 0.5,
    color: hexToRgb("#C7D2FE"),
  });

  const bottomDetails: [string, string][] = [
    ["Semester", request.semester ? `Semester ${request.semester}` : "—"],
    ["Reason", reasonLabel],
    ["Status", "APPROVED"],
    ["Issued", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
  ];

  bottomDetails.forEach(([label, value], i) => {
    const bx = 50 + i * 130;
    page.drawText(label, {
      x: bx, y: detailY - 5,
      size: 9, font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(value, {
      x: bx, y: detailY - 20,
      size: 10, font: boldFont,
      color: label === "Status" ? hexToRgb("#059669") : rgb(0.1, 0.1, 0.1),
    });
  });

  // ── Signature section 
  const sigY = 120;

  page.drawLine({
    start: { x: 50, y: sigY + 30 },
    end: { x: 180, y: sigY + 30 },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText("Registrar Signature", {
    x: 50, y: sigY + 15,
    size: 9, font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawLine({
    start: { x: width / 2 - 65, y: sigY + 30 },
    end: { x: width / 2 + 65, y: sigY + 30 },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText("Dean's Signature", {
    x: width / 2 - 45, y: sigY + 15,
    size: 9, font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Official stamp circle
  page.drawEllipse({
    x: width - 90, y: sigY + 30,
    xScale: 45, yScale: 45,
    borderColor: hexToRgb("#4F46E5"),
    borderWidth: 1.5,
  });
  page.drawText("OFFICIAL", {
    x: width - 115, y: sigY + 35,
    size: 8, font: boldFont,
    color: hexToRgb("#4F46E5"),
  });
  page.drawText("STAMP", {
    x: width - 108, y: sigY + 22,
    size: 8, font: boldFont,
    color: hexToRgb("#4F46E5"),
  });

  // Footer
  page.drawText(
    "This document is an official record of Woldia University. Any alteration renders it invalid.",
    {
      x: 50, y: 40,
      size: 8, font,
      color: rgb(0.6, 0.6, 0.6),
    }
  );

  console.log("PDF CREATED SUCCESSFULLY");

  // ── 5. Upload to Cloudinary 
  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  console.log("PDF BUFFER SIZE:", pdfBuffer.length, "bytes");
  console.log("UPLOADING TO CLOUDINARY...");

  const uploaded = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "student-clearance-certificates",
        public_id: `clearance-${request.id}`,
        format: "pdf",
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error("CLOUDINARY UPLOAD ERROR:", error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve(result);
      }
    );
    stream.end(pdfBuffer);
  });

  console.log("CLOUDINARY UPLOAD SUCCESS:", uploaded.secure_url);

  // ── 6. Save certificate record to database 
  const certificate = await prisma.clearanceCertificate.create({
    data: {
      studentId: request.student.id,
      requestId: request.id,
      fileUrl: uploaded.secure_url,
      fileName: `clearance-${request.student.studentId}.pdf`,
      publicId: uploaded.public_id,
    },
  });

  console.log("CERTIFICATE SAVED TO DB:", certificate.id);
  return certificate;
}
