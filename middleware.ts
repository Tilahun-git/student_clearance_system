import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client"; 

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/student") && !(token?.roles as RoleType[])?.includes(RoleType.STUDENT)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/advisor") && !(token?.roles as RoleType[])?.includes(RoleType.ADVISOR)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/department-head") && !(token?.roles as RoleType[])?.includes(RoleType.DEPARTMENT_HEAD)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/admin") && !(token?.roles as RoleType[])?.includes(RoleType.ADMIN)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/registrar") && !(token?.roles as RoleType[])?.includes(RoleType.REGISTRAR)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/student/:path*",
    "/advisor/:path*",
    "/admin/:path*",
    "/registrar/:path*",
    "/department-head/:path*",
  ],
};