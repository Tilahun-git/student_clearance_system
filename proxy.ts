import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { routes } from "@/lib/roles";

const PUBLIC_PAGE_PATHS = [
  "/",
  "/about",
  "/contact",
  "/unauthorized",
  "/auth",
];

const PUBLIC_API_PATHS = [
  "/api/auth",
  "/api/health",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

const API_ROLE_MAP: { prefix: string; role: string }[] = [
  { prefix: "/api/admin",           role: "ADMIN" },
  { prefix: "/api/department-head", role: "DEPARTMENT_HEAD" },
  { prefix: "/api/library",         role: "LIBRARY" },
  { prefix: "/api/registrar",       role: "REGISTRAR" },
  { prefix: "/api/staff/by-role",   role: "ADMIN" },
];

export default withAuth(
  function middleware(req) {
    const token        = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (isPublicPage(pathname) || isPublicApi(pathname)) {
      return NextResponse.next();
    }

    if (!token?.id) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const roles: string[] = ((token.roles as string[]) || []).map((r) =>
      r.trim().toUpperCase(),
    );

    if (
      token.mustChangePassword &&
      pathname !== "/auth/change-password" &&
      !pathname.startsWith("/api/auth/change-password")
    ) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Password change required" },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/auth/change-password", req.url));
    }
    if (pathname.startsWith("/api/")) {
      for (const entry of API_ROLE_MAP) {
        if (pathname.startsWith(entry.prefix)) {
          if (!roles.includes(entry.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
          return NextResponse.next();
        }
      }
      return NextResponse.next();
    }
    for (const route of routes) {
      if (pathname.startsWith(route.prefix)) {
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
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public paths are always authorized
        if (
          PUBLIC_PAGE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
          PUBLIC_API_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
        ) {
          return true;
        }
        // For everything else, we need a token — but we handle the redirect
        // ourselves in the middleware function above, so return true regardless
        // to prevent withAuth from redirecting to /api/auth/signin (which would
        // bypass our custom /auth/login page).
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|css|js)$).*)",
  ],
};
