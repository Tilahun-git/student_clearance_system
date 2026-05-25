
import { getServerSession } from "next-auth";
import { NextResponse }     from "next/server";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import { RoleType }         from "@prisma/client";

export type AuthResult =
  | { ok: true;  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>> }
  | { ok: false; response: NextResponse };

export async function requireAuth(
  _req: Request,
  allowedRoles?: RoleType[],
): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = (session.user.roles ?? []).map((r) =>
      r.trim().toUpperCase(),
    );
    const hasRole = allowedRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
  }

  return { ok: true, session };
}
