import NextAuth, { AuthOptions, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RoleType } from "@prisma/client";


type AppUser = {
  id: string;
  name: string;
  email: string;
  roles: RoleType[];
  studentId?: string;
};


declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    roles?: RoleType[];
    studentId?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      roles?: RoleType[];
      studentId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roles?: RoleType[];
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

        const roles: RoleType[] = user.roles.map((ur) => ur.role.name);

        const appUser: AppUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          roles,
          studentId: roles.includes(RoleType.STUDENT)
            ? user.studentProfile?.id
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

        if (u.roles.includes(RoleType.STUDENT)) {
          token.studentId = u.studentId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as RoleType[];

        if (token.roles?.includes(RoleType.STUDENT)) {
          session.user.studentId = token.studentId as string;
        }
      }

      return session;
    },
  },
};


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };