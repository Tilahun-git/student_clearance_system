import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

const DEFAULT_PASSWORD_HASH =
  "$2b$10$ZE.x.0OWK6uYIUOEMX0gBeCNkeP34btVdDU6kqBy.gze3RLrnvAYe";

const StudentImportSchema = z.object({
  studentId:    z.string().min(1),
  firstName:    z.string().min(1),
  lastName:     z.string().min(1),
  middleName:   z.string().optional().nullable(),
  email:        z.string().email("Invalid email address"),
  departmentId: z.string().min(1),
  program:      z.string().min(1),
  year:         z.number().int().min(1).max(10),
  section:      z.string().default("A"),
  schoolId:     z.string().optional().nullable(),
  advisorId:    z.string().optional().nullable(),
  proctorId:    z.string().optional().nullable(),
});

const BulkImportSchema = z.object({
  students: z.array(StudentImportSchema).min(1),
  source:   z.string().optional(),
});

type StudentInput = z.infer<typeof StudentImportSchema>;

interface ImportResult {
  success: boolean;
  studentId: string;
  action: "created" | "updated" | "skipped";
  email?: string;
  userId?: string;
  id?: string;
  error?: string;
}

export async function POST(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN, RoleType.REGISTRAR]);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    const parsed = BulkImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }
    const { students, source } = parsed.data;
    const results: ImportResult[] = [];
    for (const student of students) {
      results.push(await importStudent(student));
    }

    const created = results.filter((r) => r.action === "created").length;
    const updated = results.filter((r) => r.action === "updated").length;
    const failed  = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        message: "Import complete",
        source:  source ?? "unknown",
        summary: { total: students.length, created, updated, failed },
        results,
      },
      { status: 207 } 
    );
  } catch (error: any) {
    console.error("[students/import] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function importStudent(student: StudentInput): Promise<ImportResult> {
  const {
    studentId, firstName, lastName, middleName,
    email, departmentId, program, year, section,
    schoolId, advisorId,
  } = student;

  try {
    const existing = await prisma.student.findUnique({
      where:  { studentId },
      select: { id: true, userId: true },
    });

    if (existing) {
      const updated = await prisma.student.update({
        where: { studentId },
        data: {
          firstName,
          lastName,
          middleName: middleName ?? null,
          program,
          year,
          section,
          department: { connect: { id: departmentId } },
          ...(schoolId  && { school:  { connect: { id: schoolId } } }),
          ...(advisorId && { advisor: { connect: { id: advisorId } } }),
        },
        select: { id: true, userId: true },
      });

      return {
        success: true,
        studentId,
        action:  "updated",
        id:      updated.id,
        userId:  updated.userId ?? undefined,
      };
    }

    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      return {
        success: false,
        studentId,
        action: "skipped",
        error:  `Email "${email}" is already in use. Resolve manually.`,
      };
    }

    const studentRole = await prisma.role.findFirst({ where: { name: RoleType.STUDENT } });
    if (!studentRole) {
      return {
        success: false,
        studentId,
        action: "skipped",
        error:  "STUDENT role is not seeded in the database.",
      };
    }

    const { user, newStudent } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name:                `${firstName} ${lastName}`,
          email,
          password:            DEFAULT_PASSWORD_HASH, 
          mustChangePassword:  true,                  
          roles: {
            create: [{ roleId: studentRole.id }],
          },
        },
        select: { id: true, email: true },
      });

      const newStudent = await tx.student.create({
        data: {
          studentId,
          firstName,
          lastName,
          middleName: middleName ?? null,
          program,
          year,
          section,
          user:       { connect: { id: user.id } },
          department: { connect: { id: departmentId } },
          ...(schoolId  && { school:  { connect: { id: schoolId } } }),
          ...(advisorId && { advisor: { connect: { id: advisorId } } }),
        },
        select: { id: true },
      });

      return { user, newStudent };
    });

    return {
      success: true,
      studentId,
      action:  "created",
      id:      newStudent.id,
      userId:  user.id,
      email:   user.email,
    };
  } catch (error: any) {
    console.error(`[importStudent] Failed for studentId=${studentId}:`, error.message);
    return {
      success:   false,
      studentId,
      action:    "skipped",
      error:     error.message ?? "Unknown error",
    };
  }
}