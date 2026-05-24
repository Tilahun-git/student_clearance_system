/**
 * lib/apiAuth.ts
 *
 * Server-side auth helpers for API route handlers.
 * Use these inside every route.ts to enforce authentication
 * and role-based access control at the data layer — a second
 * line of defence behind the middleware.
 */

import { getServerSession } from "next-auth";
import { NextResponse }     from "next/server";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import { RoleType }         from "@prisma/client";

export type AuthResult =
  | { ok: true;  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>> }
  | { ok: false; response: NextResponse };

/**
 * requireAuth
 * Verifies the caller has a valid session.
 * Optionally checks that the session carries one of the allowed roles.
 *
 * Usage:
 *   const auth = await requireAuth(req, ["ADMIN"]);
 *   if (!auth.ok) return auth.response;
 *   const { session } = auth;
 */
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
