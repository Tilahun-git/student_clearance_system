import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

// ✅ Staff roles ONLY (exclude STUDENT)
type StaffRole = Exclude<RoleType, "STUDENT">;

export async function POST(req: Request) {
  try {
    const { name, email, password,roles,} = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, Email and Password are required" },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({ where: { email }, });
      if (existingUser) {
       return NextResponse.json(
        { error: "Account already exists" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles = Object.values(RoleType);
    const selectedRoles: RoleType[] =
      Array.isArray(roles) && roles.length > 0
        ? roles.filter((role: string) =>
            validRoles.includes(role as RoleType)
          )
        : [RoleType.STUDENT]; 
    const staffRoles: StaffRole[] = selectedRoles.filter((role): role is StaffRole => role !== RoleType.STUDENT);

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
            role: {
              connect: { id: role.id },
            },
          })),
        },
        staffProfile:
          staffRoles.length > 0 ? {
                create: {
                  departmentId: null,
                },
              }
            : undefined,
      },

      include: {
        roles: {
          include: { role: true },
        },
        staffProfile: true,
      },
    });

    return NextResponse.json(
      {
        message: "User account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error, unable to create user" },
      { status: 500 }
    );
  }
}