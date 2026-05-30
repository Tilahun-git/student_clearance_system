import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import * as XLSX from "xlsx";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

const DEFAULT_PASSWORD_HASH =
  "$2b$10$ZE.x.0OWK6uYIUOEMX0gBeCNkeP34btVdDU6kqBy.gze3RLrnvAYe";

const FIELD_ALIASES: Record<string, string> = {
  firstname: "firstName",
  "first name": "firstName",
  "given name": "firstName",
  middlename: "middleName",
  "middle name": "middleName",
  lastname: "lastName",
  "last name": "lastName",
  surname: "lastName",
  email: "email",
  studentid: "studentId",
  "student id": "studentId",
  program: "program",
  year: "year",
  section: "section",
  schoolid: "schoolId",
  "school id": "schoolId",
  schoolname: "schoolName",
  "school name": "schoolName",
  school: "schoolName",
  departmentid: "departmentId",
  "department id": "departmentId",
  departmentname: "departmentName",
  "department name": "departmentName",
  department: "departmentName",
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, "");
}

function parseCsvLine(line: string) {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

function parseCsv(content: string) {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = normalized.split("\n").filter((line) => line.trim().length > 0);
  if (rows.length === 0) return [];

  const headers = parseCsvLine(rows[0]).map(normalizeHeader);
  return rows.slice(1).map((row) => {
    const values = parseCsvLine(row);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index]?.trim() ?? "";
    });
    return record;
  });
}

function normalizeRow(rawRow: Record<string, unknown>) {
  const normalized: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(rawRow)) {
    const key = normalizeHeader(rawKey);
    const fieldName = FIELD_ALIASES[key];
    if (!fieldName) continue;
    normalized[fieldName] = rawValue == null ? "" : String(rawValue).trim();
  }
  return normalized;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function generateStudentId() {
  const gregorianYear = new Date().getFullYear();
  const ethiopianYear = gregorianYear - 8;
  const yearCode = String(ethiopianYear).slice(-2);
  const count = await prisma.student.count({
    where: { studentId: { startsWith: `WDU${yearCode}` } },
  });
  const sequence = String(count + 1).padStart(3, "0");
  return `WDU${yearCode}${sequence}`;
}

async function parseSpreadsheet(file: File) {
  const filename = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (filename.endsWith(".csv") || file.type === "text/csv") {
    return parseCsv(buffer.toString("utf-8"));
  }

  if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });
    return json.map((row) => {
      const mapped: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        mapped[normalizeHeader(key)] = value == null ? "" : String(value).trim();
      }
      return mapped;
    });
  }

  throw new Error("Unsupported file type. Upload a CSV or XLSX file.");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles: string[] = session?.user?.roles || [];
    if (!userRoles.includes("REGISTRAR")) {
      return NextResponse.json(
        { error: "Unauthorized - Registrar only" },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please upload a non-empty CSV or XLSX file." },
        { status: 400 },
      );
    }

    const rawRows = await parseSpreadsheet(file);
    if (!rawRows.length) {
      return NextResponse.json(
        { error: "No rows found in the uploaded file." },
        { status: 400 },
      );
    }

    const schools = await prisma.school.findMany({ select: { id: true, name: true } });
    const departments = await prisma.department.findMany({ select: { id: true, name: true, schoolId: true } });

    const schoolNameMap = new Map(
      schools.map((school) => [school.name.toLowerCase(), school.id]),
    );

    const departmentNameMap = new Map<string, string>();
    const departmentNameSchoolMap = new Map<string, string>();
    departments.forEach((department) => {
      departmentNameMap.set(department.name.toLowerCase(), department.id);
      departmentNameSchoolMap.set(
        `${department.schoolId}|${department.name.toLowerCase()}`,
        department.id,
      );
    });

    const studentRole = await prisma.role.findUnique({ where: { name: RoleType.STUDENT } });
    if (!studentRole) {
      return NextResponse.json(
        { error: "STUDENT role is not configured in the database." },
        { status: 500 },
      );
    }

    const results: Array<{
      row: number;
      success: boolean;
      action: "created" | "skipped";
      studentId?: string;
      email?: string;
      userId?: string;
      id?: string;
      error?: string;
    }> = [];

    for (let index = 0; index < rawRows.length; index++) {
      const rawRow = normalizeRow(rawRows[index]);
      const rowNumber = index + 2;
      const firstName = rawRow.firstName?.trim();
      const lastName = rawRow.lastName?.trim();
      const middleName = rawRow.middleName?.trim() || null;
      const email = rawRow.email?.trim();
      const program = rawRow.program?.trim();
      const year = Number(rawRow.year ?? "");
      const section = rawRow.section?.trim() || "A";
      const rawStudentId = rawRow.studentId?.trim() || null;
      const schoolId = rawRow.schoolId?.trim() || null;
      const schoolName = rawRow.schoolName?.trim() || null;
      const departmentId = rawRow.departmentId?.trim() || null;
      const departmentName = rawRow.departmentName?.trim() || null;

      if (!firstName || !lastName || !email || !program || !year || (!departmentId && !departmentName)) {
        results.push({
          row: rowNumber,
          success: false,
          action: "skipped",
          error: "Missing required columns: firstName, lastName, email, program, year, departmentId or departmentName.",
        });
        continue;
      }

      if (!isValidEmail(email)) {
        results.push({
          row: rowNumber,
          success: false,
          action: "skipped",
          error: "Invalid email address.",
        });
        continue;
      }

      const resolvedSchoolId =
        schoolId || (schoolName ? schoolNameMap.get(schoolName.toLowerCase()) : undefined);

      let resolvedDepartmentId = departmentId;
      if (!resolvedDepartmentId && departmentName) {
        if (resolvedSchoolId) {
          resolvedDepartmentId =
            departmentNameSchoolMap.get(
              `${resolvedSchoolId}|${departmentName.toLowerCase()}`,
            ) ?? null;
        }
        if (!resolvedDepartmentId) {
          resolvedDepartmentId =
            departmentNameMap.get(departmentName.toLowerCase()) ?? null;
        }
      }

      if (!resolvedDepartmentId) {
        results.push({
          row: rowNumber,
          success: false,
          action: "skipped",
          error: `Department not found for "${departmentName ?? departmentId}". Use a valid department name or ID.`,
        });
        continue;
      }

      const studentId = rawStudentId || (await generateStudentId());

      try {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
          results.push({
            row: rowNumber,
            success: false,
            action: "skipped",
            email,
            error: "Email already exists in the system.",
          });
          continue;
        }

        const existingStudent = await prisma.student.findUnique({
          where: { studentId },
          select: { id: true },
        });

        if (existingStudent) {
          results.push({
            row: rowNumber,
            success: false,
            action: "skipped",
            studentId,
            error: "Student ID already exists.",
          });
          continue;
        }

        const { user, student } = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name: `${firstName} ${lastName}`,
              email,
              password: DEFAULT_PASSWORD_HASH,
              mustChangePassword: true,
              roles: {
                create: [{ roleId: studentRole.id }],
              },
            },
            select: { id: true, email: true },
          });

          const student = await tx.student.create({
            data: {
              studentId,
              firstName,
              lastName,
              middleName,
              program,
              year,
              section,
              user: { connect: { id: user.id } },
              department: { connect: { id: resolvedDepartmentId } },
              ...(resolvedSchoolId ? { school: { connect: { id: resolvedSchoolId } } } : {}),
            },
            select: { id: true },
          });

          return { user, student };
        });

        results.push({
          row: rowNumber,
          success: true,
          action: "created",
          studentId,
          email: user.email,
          userId: user.id,
          id: student.id,
        });
      } catch (error: any) {
        console.error(`[registrar/bulk import] Row ${rowNumber} failed:`, error?.message ?? error);
        results.push({
          row: rowNumber,
          success: false,
          action: "skipped",
          studentId,
          email,
          error: error?.message ?? "Failed to import row.",
        });
      }
    }

    const created = results.filter((item) => item.success).length;
    const skipped = results.filter((item) => !item.success).length;

    return NextResponse.json({
      message: "Bulk import completed.",
      summary: {
        total: rawRows.length,
        created,
        skipped,
      },
      results,
    });
  } catch (error: any) {
    console.error("REGISTRAR BULK IMPORT ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process bulk import." },
      { status: 500 },
    );
  }
}
