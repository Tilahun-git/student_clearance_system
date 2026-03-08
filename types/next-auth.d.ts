// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: "STUDENT" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "STUDENT" | "ADMIN";
  }

  interface JWT {
    role?: "STUDENT" | "ADMIN";
  }
}