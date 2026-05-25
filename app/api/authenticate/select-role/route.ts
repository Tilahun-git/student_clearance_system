import { getToken, encode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { routes } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

function getRedirectByRole(role: string): string {
  const match = routes.find((r) => r.role === role.toUpperCase());
  return match?.redirect ?? "/unauthorized";
}

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role")?.toUpperCase();
  const baseUrl = process.env.NEXTAUTH_URL ?? req.nextUrl.origin;
  if (!role) {
    return NextResponse.redirect(new URL("/auth/login", baseUrl));
  }
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
  });
  if (!token?.id) {
    return NextResponse.redirect(new URL("/auth/login", baseUrl));
  }
  const freshUser = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: {
      isActive: true,
      mustChangePassword: true,
      roles: { include: { role: true } },
      studentProfile: { select: { studentId: true } },
    },
  });
  if (!freshUser || !freshUser.isActive) {
    return NextResponse.redirect(new URL("/auth/login", baseUrl));
  }
  const freshRoles: string[] = freshUser.roles.map((ur) => ur.role.name as string);
  if (!freshRoles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", baseUrl));
  }
  const updatedToken = {
    ...token,
    roles: freshRoles,
    activeRole: role,
    mustChangePassword: freshUser.mustChangePassword,
    ...(freshRoles.includes("STUDENT") && {
      studentId: freshUser.studentProfile?.studentId,
    }),
  };

  const newToken = await encode({
    token: updatedToken,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const destination = getRedirectByRole(role);
  const response = NextResponse.redirect(new URL(destination, baseUrl));
  const isSecure = baseUrl.startsWith("https");
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
  response.cookies.set(cookieName, newToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
  });

  return response;
}
