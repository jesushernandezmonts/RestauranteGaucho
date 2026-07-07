// next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    nombre?: string;
  }
  interface Session {
    user: {
      id: number;
      role: string;
      nombre: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string;
    nombre: string;
  }
}
