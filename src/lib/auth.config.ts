import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client/.prisma/client/index.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

function createClient() {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
  let dbPath = dbUrl.replace("file:", "").trim();
  if (!dbPath.startsWith("/") && !dbPath.startsWith("C:")) {
    dbPath = require("path").resolve(process.cwd(), dbPath);
  }
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/mesero/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.role = user.role as string;
        token.nombre = user.nombre as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).nombre = token.nombre;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        usuario: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usuario || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { usuario: credentials.usuario as string },
        });

        if (!user || !user.activo) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: String(user.id),
          email: user.usuario,
          name: user.nombre,
          role: user.role,
          nombre: user.nombre,
        };
      },
    }),
  ],
};
