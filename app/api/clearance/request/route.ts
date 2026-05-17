import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createClearanceRequest } from "@/lib/clearance/clearance.service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const roles = session?.user?.roles ?? [];

    if (!session?.user?.id || !roles.includes("STUDENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const clearance = await createClearanceRequest(session.user.id, body);
    return NextResponse.json(clearance, { status: 201 });
  } catch (error: any) {
    console.error("CLEARANCE REQUEST ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create clearance request" },
      { status: 500 },
    );
  }
}
