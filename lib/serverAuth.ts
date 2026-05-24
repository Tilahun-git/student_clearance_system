/**
 * lib/serverAuth.ts
 *
 * Server-side auth guard for Next.js layouts and pages (Server Components).
 * Works even with a custom server.js — no middleware required.
 *
 * Usage in a layout.tsx:
 *   import { requireRole } from "@/lib/serverAuth";
 *   export default async function AdminLayout({ children }) {
 *     await requireRole("ADMIN");
 *     return <>{children}</>;
 *   }
 */

import { getServerSession } from "next-auth";
import { redirect }         from "next/navigation";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import { RoleType }         from "@prisma/client";

/**
 * Enforces that the current request has a valid session AND carries the
 * required role. Redirects server-side (no flash) if either check fails.
 *
 * @param requiredRole  The RoleType the user must have.
 * @param loginPath     Where to send unauthenticated users (default: /auth/login).
 * @param deniedPath    Where to send authenticated-but-wrong-role users (default: /unauthorized).
 */
export async function requireRole(
  requiredRole: RoleType,
  loginPath  = "/auth/login",
  deniedPath = "/unauthorized",
) {
  const session = await getServerSession(authOptions);

  // Not logged in → go to login
  if (!session?.user?.id) {
    redirect(loginPath);
  }

  // mustChangePassword → force password change first
  if (session.user.mustChangePassword) {
    redirect("/auth/change-password");
  }

  const roles: string[] = (session.user.roles ?? []).map((r) =>
    r.trim().toUpperCase(),
  );

  // Logged in but wrong role → go to unauthorized
  if (!roles.includes(requiredRole as string)) {
    redirect(deniedPath);
  }

  return session;
}
