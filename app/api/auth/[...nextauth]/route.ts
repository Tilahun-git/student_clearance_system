import NextAuth, { AuthOptions, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RoleType } from "@prisma/client";

type AppUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  studentId?: string;
};

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    roles?: string[];
    studentId?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      roles?: string[];
      studentId?: string;
      activeRole?: string;
      mustChangePassword?: boolean;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roles?: string[];
    studentId?: string;
    activeRole?: string;
    mustChangePassword?: boolean;
  }
}
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            roles: { include: { role: true } },
            studentProfile: true,
          },
        });

        if (!user || !user.isActive) return null;
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;
        const roles: string[] = user.roles.map((ur) => ur.role.name);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roles,
          mustChangePassword: user.mustChangePassword,
          studentId: roles.includes("STUDENT")
            ? user.studentProfile?.studentId
            : undefined,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, 

  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as AppUser;
        token.id = u.id;
        token.roles = u.roles;
        token.activeRole =
          u.roles.filter((r) => r !== "STUDENT")[0] ?? u.roles[0];
        token.mustChangePassword = (u as any).mustChangePassword ?? false;
        if (u.roles.includes("STUDENT")) {
          token.studentId = u.studentId;
        }
      }
      if (token.id) {
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
          return {} as any;
        }
        const freshRoles = freshUser.roles.map((ur) => ur.role.name);
        token.roles = freshRoles;
        token.mustChangePassword = freshUser.mustChangePassword;

        if (
          token.activeRole &&
          !freshRoles.includes(token.activeRole as RoleType)
        ) {
          token.activeRole =
            freshRoles.filter((r) => r !== "STUDENT")[0] ?? freshRoles[0];
        }
        if (freshRoles.includes("STUDENT")) {
          token.studentId = freshUser.studentProfile?.studentId;
        }
      }

      if (trigger === "update" && session?.activeRole) {
        token.activeRole = session.activeRole;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.id) {
        return { ...session, user: undefined as any };
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        session.user.activeRole = token.activeRole as string;
        session.user.mustChangePassword =
          token.mustChangePassword as boolean;

        if ((token.roles as string[])?.includes("STUDENT")) {
          session.user.studentId = token.studentId as string;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const safeBase = process.env.NEXTAUTH_URL || baseUrl;
      if (url.startsWith("/")) {
        return `${safeBase}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return safeBase;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };