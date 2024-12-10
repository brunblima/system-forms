import NextAuth, { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/services/database/db";
import { compareSync } from "bcrypt-ts";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
    verifyRequest: "/",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          throw new AuthError("Preencha todos os campos");
        }

        const user = await db.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!user) {
          throw new AuthError("Credenciais Inválidas");
        }

        const passwordMatch = compareSync(password, user.password ?? "");
        if (!passwordMatch) {
          throw new AuthError("Credenciais Inválidas");
        }

        return user;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});
