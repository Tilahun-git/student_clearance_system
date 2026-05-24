import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { requireAuth } from "@/lib/apiAuth";

// GET — list all borrowed students recorded by this library manager
export async function GET(req: Request) {
  const auth = await requireAuth(req, [RoleType.LIBRARY]);
  if (!auth.ok) return auth.response;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({ where: { userId: session.user.id } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const borrows = await prisma.libraryBorrow.findMany({
      where: { addedBy: staff.id },
      include: {
        student: {
          include: {
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(borrows);
  } catch (error) {
    console.error("LIBRARY_BORROWS_GET_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch borrows" }, { status: 500 });
  }
}

// POST — add a student to the borrowed list by studentId string
export async function POST(req: Request) {
  const auth = await requireAuth(req, [RoleType.LIBRARY]);
  if (!auth.ok) return auth.response;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({ where: { userId: session.user.id } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { studentId } });
    if (!student) {
      return NextResponse.json({ error: `Student "${studentId}" not found` }, { status: 404 });
    }

    // Prevent duplicate active borrow records
    const existing = await prisma.libraryBorrow.findFirst({
      where: { studentId: student.id, addedBy: staff.id, returned: false },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This student already has an unreturned borrow record" },
        { status: 409 },
      );
    }

    const borrow = await prisma.libraryBorrow.create({
      data: { studentId: student.id, addedBy: staff.id },
      include: {
        student: { include: { department: { select: { name: true } } } },
      },
    });

    return NextResponse.json(borrow, { status: 201 });
  } catch (error) {
    console.error("LIBRARY_BORROWS_POST_ERROR", error);
    return NextResponse.json({ error: "Failed to add borrow record" }, { status: 500 });
  }
}
