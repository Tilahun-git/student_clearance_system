import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      password,
      roles,
      studentId,
      program,
      year,
      departmentId,
      advisorId,
    } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, Email and Password are required" },
        { status: 400 }
      );
    }

    // ✅ Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const selectedRoles: RoleType[] =
      Array.isArray(roles) && roles.length > 0
        ? roles.filter((r: string) =>
            Object.values(RoleType).includes(r as RoleType)
          )
        : [RoleType.STUDENT];

    const roleRecords = [];
    for (const roleName of selectedRoles) {
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
      roleRecords.push(role);
    }

    // 🔥 CREATE USER
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

        studentProfile: selectedRoles.includes(RoleType.STUDENT)
          ? {
              create: {
                studentId, // 🔥 REQUIRED
                program: program || "Undeclared",
                year: year || 1,
                departmentId,
                advisorId, // ⚠️ must be Staff.id
              },
            }
          : undefined,

        staffProfile:
          selectedRoles.includes(RoleType.ADVISOR) ||
          selectedRoles.includes(RoleType.DEPARTMENT_HEAD) ||
          selectedRoles.includes(RoleType.FINANCE) ||
          selectedRoles.includes(RoleType.LIBRARY) ||
          selectedRoles.includes(RoleType.REGISTRAR)
            ? {
                create: {
                  departmentId: departmentId || null,
                },
              }
            : undefined,
      },

      include: {
        roles: { include: { role: true } },
        studentProfile: true,
        staffProfile: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error, unable to register user" },
      { status: 500 }
    );
  }
}