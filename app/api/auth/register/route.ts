import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, roles } = await req.json();

    if (!name|| !email || !password) {
      return NextResponse.json(
        { error: "Name, Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const selectedRoles = Array.isArray(roles) && roles.length > 0 ? roles : ["STUDENT"];

    const roleRecords = [];
    for (const roleName of selectedRoles) {
      const role = await prisma.role.upsert({
        where: { name: roleName as any },
        update: {},
        create: { name: roleName as any },
      });
      roleRecords.push(role);
    }

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
      include: { roles: { include: { role: true } } },
    });

    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}