import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH — toggle returned status
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { returned } = await req.json();

    const borrow = await prisma.libraryBorrow.update({
      where: { id },
      data: { returned: Boolean(returned) },
    });

    return NextResponse.json(borrow);
  } catch (error) {
    console.error("LIBRARY_BORROW_PATCH_ERROR", error);
    return NextResponse.json({ error: "Failed to update borrow record" }, { status: 500 });
  }
}

// DELETE — remove a borrow record
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.libraryBorrow.delete({ where: { id } });
    return NextResponse.json({ message: "Borrow record deleted" });
  } catch (error) {
    console.error("LIBRARY_BORROW_DELETE_ERROR", error);
    return NextResponse.json({ error: "Failed to delete borrow record" }, { status: 500 });
  }
}
