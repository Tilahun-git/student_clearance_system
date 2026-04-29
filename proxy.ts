import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const roles: string[] = token?.roles || [];
    console.log("roles are : ", roles)

    if (
      path.startsWith("/student") &&
      !roles.includes("STUDENT")
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/advisor") &&
      !roles.includes("ADVISOR")
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/department-head") &&
      !roles.includes("DEPARTMENT_HEAD")
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/admin") &&
      !roles.includes("ADMIN")
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/registrar") &&
      !roles.includes("REGISTRAR")
    ) {
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



// import { NextResponse } from "next/server";

// export function proxy() {
//   return NextResponse.next(); // ✅ allow everything
// }

// export const config = {
//   matcher: ["/:path*"],
// };