import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { routes } from "@/lib/roles";

const PUBLIC_PATHS = ["/", "/about", "/contact", "/auth", "/api/auth", "/unauthorized"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path  = req.nextUrl.pathname;

    if (isPublic(path)) return NextResponse.next();

    // Empty token (id missing) means the JWT callback invalidated it
    // because the user was deactivated — force back to login
    if (!token?.id) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const roles: string[] = (token?.roles || []).map((r: string) =>
      r.trim().toUpperCase()
    );

    for (const route of routes) {
      if (path.startsWith(route.prefix)) {
        if (!roles.includes(route.role)) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        if (isPublic(pathname)) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};