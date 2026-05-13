import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
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

  const request = await prisma.clearanceRequest.findUnique({
    where: { id: requestId },
    include: {
      student: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!request) throw new Error("Request not found");
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.82, 0.84, 0.86),
    borderWidth: 2,
  });
  try {
const logoPath = path.join(process.cwd(),"public","wldu_logo.jpg");    
const logoBytes = await fs.readFile(logoPath);
    const logo = await pdfDoc.embedPng(logoBytes);
    const logoWidth = 70;
    const logoHeight = 70;
    page.drawImage(logo, {
      x: width / 2 - logoWidth / 2,
      y: height - 110,
      width: logoWidth,
      height: logoHeight,
    });
  } catch (err) {
    console.log("Main logo failed:", err);
  }
  page.drawText("VERIFIED", {
    x: width / 2 - 60,
    y: height - 150,
    size: 28,
    font: boldFont,
    color: hexToRgb("#15803d"),
  });

  page.drawText("STUDENT CLEARANCE CERTIFICATE", {
    x: width / 2 - 160,
    y: height - 180,
    size: 13,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  try {
const logoPath = path.join(process.cwd(),"public","wldu_logo.jpg");   
 const logoBytes = await fs.readFile(logoPath);

    const logo = await pdfDoc.embedPng(logoBytes);

    page.drawImage(logo, {
      x: width / 2 - 160,
      y: height / 2 - 200,
      width: 320,
      height: 320,
      opacity: 0.05,
    });
  } catch (err) {
    console.log("Watermark skipped:", err);
  }

  page.drawText("This is to certify that", {
    x: 70,
    y: height - 240,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(
    `${request.student.firstName} ${request.student.lastName}`,
    {
      x: 70,
      y: height - 280,
      size: 24,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    }
  );

  page.drawText(
    "has successfully completed all university clearance requirements.",
    {
      x: 70,
      y: height - 320,
      size: 13,
      font,
      color: rgb(0.4, 0.4, 0.4),
    }
  );

  const startY = height - 380;

  const details = [
    `Student ID: ${request.student.studentId}`,
    `Department: ${request.student.department.name}`,
    `Program: ${request.student.program}`,
    `Academic Year: ${request.academicYear}`,
    `Semester: ${request.semester}`,
    `Reason: ${request.reason}`,
  ];

  details.forEach((text, i) => {
    page.drawText(text, {
      x: 70,
      y: startY - i * 25,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  page.drawText(`Issued Date: ${new Date().toDateString()}`, {
    x: 70,
    y: 80,
    size: 11,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText("VALID OFFICIAL DOCUMENT", {
    x: width - 200,
    y: 80,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawLine({
    start: { x: width - 220, y: 140 },
    end: { x: width - 80, y: 140 },
    thickness: 1,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText("Registrar Signature", {
    x: width - 200,
    y: 120,
    size: 11,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  console.log("PDF CREATED");

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  console.log("PDF BUFFER SIZE:", pdfBuffer.length);
  console.log("UPLOADING TO CLOUDINARY...");

  const uploaded = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "student-clearance-certificates",
        public_id: `clearance-${request.id}`,
        format: "pdf",
      },
      (error, result) => {
        if (error) {
          console.log("CLOUDINARY ERROR:", error);
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(pdfBuffer);
  });

  const certificate = await prisma.clearanceCertificate.create({
    data: {
      studentId: request.student.id,
      requestId: request.id,
      fileUrl: uploaded.secure_url,
      fileName: `clearance-${request.id}.pdf`,
      publicId: uploaded.public_id,
    },
  });

  return certificate;
}