

import { getServerSession } from "next-auth";
import { redirect }         from "next/navigation";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import { RoleType }         from "@prisma/client";

export async function requireRole(
  requiredRole: RoleType,
  loginPath  = "/auth/login",
  deniedPath = "/unauthorized",
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(loginPath);
  }

  if (session.user.mustChangePassword) {
    redirect("/auth/change-password");
  }

  const roles: string[] = (session.user.roles ?? []).map((r) =>
    r.trim().toUpperCase(),
  );

  if (!roles.includes(requiredRole as string)) {
    redirect(deniedPath);
  }

  return session;
}
