import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";



export async function POST(req: Request) {
  try {
    const { name, email, password, roles, studentId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, Email and Password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const selectedRoles: RoleType[] =
      Array.isArray(roles) && roles.length > 0
        ? roles
        : [RoleType.STUDENT];

    const isStudent = selectedRoles.includes(RoleType.STUDENT);

    const roleRecords = await prisma.role.findMany({
      where: {
        name: {
          in: selectedRoles,
        },
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,

        roles: {
          create: roleRecords.map((role) => ({
            role: { connect: { id: role.id } },
          })),
        },
      },
    });

    if (isStudent) {
      if (!studentId) {
        return NextResponse.json(
          { error: "studentId is required for student account" },
          { status: 400 }
        );
      }

      const student = await prisma.student.findUnique({
        where: { studentId }, 
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      if (student.userId) {
        return NextResponse.json(
          { error: "Student already has an account" },
          { status: 400 }
        );
      }

      await prisma.student.update({
        where: { studentId }, 
        data: {
          userId: user.id, 
        },
      });
    }

    return NextResponse.json(
      {
        message: "User created and linked successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}