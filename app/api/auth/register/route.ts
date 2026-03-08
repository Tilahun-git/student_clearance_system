import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, roles } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role if none selected
    const selectedRoles = Array.isArray(roles) && roles.length > 0 ? roles : ["STUDENT"];

    // Ensure all roles exist in Role table
    const roleRecords = [];
    for (const roleName of selectedRoles) {
      const role = await prisma.role.upsert({
        where: { name: roleName as any },
        update: {},
        create: { name: roleName as any },
      });
      roleRecords.push(role);
    }

    // Create user and link roles
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roles: {
          create: roleRecords.map((role) => ({
            role: { connect: { id: role.id } },
          })),
        },
      },
      include: { roles: { include: { role: true } } },
    });

    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}