import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const config = {
  matcher: ["/mesero/:path*", "/cocina/:path*", "/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NEVER block login pages — avoids redirect loops
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.endsWith("/login")
  ) {
    return NextResponse.next();
  }

  const session = await auth();

  // Mesero routes
  if (pathname.startsWith("/mesero")) {
    if (!session) {
      return NextResponse.redirect(new URL("/mesero/login", request.url));
    }
    if (session.user.role !== "MESERO" && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Chef routes
  if (pathname.startsWith("/cocina")) {
    if (!session) {
      return NextResponse.redirect(new URL("/cocina/login", request.url));
    }
    if (session.user.role !== "CHEF" && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
