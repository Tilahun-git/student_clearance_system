import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { routes } from "@/lib/roles";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const roles: string[] = (token?.roles || []).map((r: string) =>
      r.trim().toUpperCase()
    );
    console.log("PATH:", path);
    console.log("ROLES:", roles);
    for (const route of routes) {
      if (path.startsWith(route.prefix)) {
        if (!roles.includes(route.role)) {
          return NextResponse.redirect(
            new URL("/unauthorized", req.url)
          );
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
        if (
          pathname.startsWith("/auth") ||
          pathname.startsWith("/api/auth") ||
          pathname === "/unauthorized"
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|unauthorized).*)"],
};