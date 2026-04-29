import NextAuth, { AuthOptions, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


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
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roles?: string[]; 
    studentId?: string;
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

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        const roles: string[] = user.roles.map(
          (ur) => ur.role.name
        );

        const appUser: AppUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          roles,
          studentId: roles.includes("STUDENT")
            ? user.studentProfile?.studentId
            : undefined,
        };

        return appUser as any;
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AppUser;

        token.id = u.id;
        token.roles = u.roles;

        if (u.roles.includes("STUDENT")) {
          token.studentId = u.studentId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];

        if (token.roles?.includes("STUDENT")) {
          session.user.studentId = token.studentId as string;
        }
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };