import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { RoleType } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// ─── PATCH /api/super-proctor/proctors/[id] ───────────────────────────────────
// Updates proctor fields + syncs name/email on the linked User.
// Body: { firstName?, lastName?, middleName?, email?, blockNumber? }
export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireAuth(req, [RoleType.SUPER_PROCTOR]);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const { firstName, lastName, middleName, email, blockNumber } = await req.json();

    const proctor = await prisma.proctor.findUnique({ where: { id } });
    if (!proctor) {
      return NextResponse.json({ error: "Proctor not found" }, { status: 404 });
    }

    // Guard: new email must not conflict with another user
    if (email && email.trim().toLowerCase() !== proctor.email) {
      const conflict = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 },
        );
      }
    }

    // Guard: new blockNumber must not conflict with another proctor
    if (blockNumber != null && Number(blockNumber) !== proctor.blockNumber) {
      const blockConflict = await prisma.proctor.findUnique({
        where: { blockNumber: Number(blockNumber) },
      });
      if (blockConflict && blockConflict.id !== id) {
        return NextResponse.json(
          { error: `Block number ${blockNumber} is already assigned to another proctor` },
          { status: 400 },
        );
      }
    }

    const newFirstName = firstName?.trim() ?? proctor.firstName;
    const newLastName  = lastName?.trim()  ?? proctor.lastName;
    const newEmail     = email?.trim().toLowerCase() ?? proctor.email;

    const updated = await prisma.$transaction(async (tx) => {
      // Sync User record
      await tx.user.update({
        where: { id: proctor.userId },
        data: {
          name:  `${newFirstName} ${newLastName}`,
          email: newEmail,
        },
      });

      // Update Proctor record
      return tx.proctor.update({
        where: { id },
        data: {
          firstName:  newFirstName,
          lastName:   newLastName,
          middleName: middleName !== undefined ? (middleName?.trim() || null) : proctor.middleName,
          email:      newEmail,
          blockNumber: blockNumber !== undefined
            ? (blockNumber != null ? Number(blockNumber) : null)
            : proctor.blockNumber,
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
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("UPDATE_PROCTOR_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Failed to update proctor" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/super-proctor/proctors/[id] ──────────────────────────────────
// Deletes the Proctor record and its linked User.
// Also clears proctorId on any students assigned to this proctor.
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireAuth(_req, [RoleType.SUPER_PROCTOR]);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;

    const proctor = await prisma.proctor.findUnique({ where: { id } });
    if (!proctor) {
      return NextResponse.json({ error: "Proctor not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Unassign proctor from all students
      await tx.student.updateMany({
        where: { proctorId: id },
        data:  { proctorId: null },
      });

      // Delete Proctor record first (FK constraint)
      await tx.proctor.delete({ where: { id } });

      // Delete the linked User
      await tx.user.delete({ where: { id: proctor.userId } });
    });

    return NextResponse.json({ success: true, message: "Proctor deleted successfully" });
  } catch (error: any) {
    console.error("DELETE_PROCTOR_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete proctor" },
      { status: 500 },
    );
  }
}
