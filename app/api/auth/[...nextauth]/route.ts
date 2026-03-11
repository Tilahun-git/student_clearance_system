import NextAuth, { AuthOptions, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User extends DefaultUser {
    roles?: string[];
  }
  interface Session {
    user: User;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { roles: { include: { role: true } } },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Return object compatible with NextAuth.User
        return {
          id: user.id,
          email: user.email,
          roles: user.roles.map((ur) => ur.role.name), 
        } as Partial<DefaultUser> & { roles: string[] };
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.roles = user.roles || [];
      return token;
    }, 
    async session({ session, token }) {
      if (session.user) session.user.roles = token.roles || [];
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };