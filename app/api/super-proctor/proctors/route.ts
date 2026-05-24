import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";

// ─── GET /api/super-proctor/proctors ─────────────────────────────────────────
// Returns all regular (non-super) Proctor records.
export async function GET(req: Request) {
  const auth = await requireAuth(req, [RoleType.SUPER_PROCTOR]);
  if (!auth.ok) return auth.response;

  try {
    const proctors = await prisma.proctor.findMany({
      where: { isSuperProctor: false },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id:          true,
        firstName:   true,
        lastName:    true,
        middleName:  true,
        email:       true,
        blockNumber: true,
        userId:      true,
      },
    });

    return NextResponse.json({ success: true, data: proctors });
  } catch (error) {
    console.error("FETCH_PROCTORS_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch proctors" }, { status: 500 });
  }
}

// ─── POST /api/super-proctor/proctors ────────────────────────────────────────
// Registers a new proctor:
//   1. Creates a real User with DORMITORY role + mustChangePassword: true
//   2. Creates a Proctor record linked to that User
// Body: { firstName, lastName, middleName?, email, password, blockNumber? }
export async function POST(req: Request) {
  const auth = await requireAuth(req, [RoleType.SUPER_PROCTOR]);
  if (!auth.ok) return auth.response;

  try {
    const { firstName, lastName, middleName, email, password, blockNumber } =
      await req.json();

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "firstName, lastName, email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Guard: email must be unique across User table
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    // Guard: blockNumber must be unique if provided
    if (blockNumber != null) {
      const blockTaken = await prisma.proctor.findUnique({
        where: { blockNumber: Number(blockNumber) },
      });
      if (blockTaken) {
        return NextResponse.json(
          { error: `Block number ${blockNumber} is already assigned to another proctor` },
          { status: 400 },
        );
      }
    }

    // Resolve DORMITORY role
    const dormitoryRole = await prisma.role.findUnique({
      where: { name: RoleType.DORMITORY },
    });
    if (!dormitoryRole) {
      return NextResponse.json(
        { error: "DORMITORY role is not seeded in the database" },
        { status: 500 },
      );
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const fullName       = `${firstName.trim()} ${lastName.trim()}`;

    // Atomic: create User → create Proctor
    const { proctor } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name:               fullName,
          email:              email.trim().toLowerCase(),
          password:           hashedPassword,
          isActive:           true,
          mustChangePassword: true,   // force password reset on first login
          roles: {
            create: [{ roleId: dormitoryRole.id }],
          },
        },
      });

      const proctor = await tx.proctor.create({
        data: {
          userId:         user.id,
          firstName:      firstName.trim(),
          lastName:       lastName.trim(),
          middleName:     middleName?.trim() || null,
          email:          email.trim().toLowerCase(),
          blockNumber:    blockNumber != null ? Number(blockNumber) : null,
          isSuperProctor: false,
        },
        select: {
          id:          true,
          firstName:   true,
          lastName:    true,
          middleName:  true,
          email:       true,
          blockNumber: true,
          userId:      true,
        },
      });

      return { user, proctor };
    });

    return NextResponse.json({ success: true, data: proctor }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE_PROCTOR_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Failed to register proctor" },
      { status: 500 },
    );
  }
}
