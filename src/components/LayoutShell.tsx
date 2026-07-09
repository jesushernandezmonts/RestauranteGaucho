"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/** Routes where the landing Navbar & Footer should be hidden */
const INTERNAL_ROUTES = ["/admin", "/cocina", "/mesero", "/acceso"];

function isInternalRoute(pathname: string): boolean {
  return INTERNAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInternal = isInternalRoute(pathname);

  return (
    <>
      {!isInternal && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isInternal && <Footer />}
    </>
  );
}
