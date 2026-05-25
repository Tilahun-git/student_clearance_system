import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/apiAuth";
import { RoleType } from "@prisma/client";

export async function POST(req: Request) {
  const auth = await requireAuth(req, [RoleType.ADMIN]);
  if (!auth.ok) return auth.response;

  try {
    const { name, email, password, studentId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 },
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required for student account creation" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Account already exists" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    if (student.userId) {
      return NextResponse.json({ error: "Student already has an account" }, { status: 400 });
    }

    const studentRole = await prisma.role.findUnique({ where: { name: RoleType.STUDENT} });
    if (!studentRole) {
      return NextResponse.json(
        { error: "STUDENT role not seeded in database" },
        { status: 500 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mustChangePassword: true, // force password change on first login
        roles: { create: { roleId: studentRole.id } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        roles: { include: { role: true } },
      },
    });

    await prisma.student.update({
      where: { studentId },
      data: { userId: user.id },
    });

    console.log("created student is :", user)
    return NextResponse.json(
      { message: "Student account created successfully", user },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("CREATE STUDENT USER ERROR:", error);
    return NextResponse.json({ error: "Server errorrrrrrrrrrrrrrrrr" }, { status: 500 });
  }
}
