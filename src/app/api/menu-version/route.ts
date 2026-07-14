import { NextResponse } from "next/server";

// Simple in-memory version counter. Bumped when menu changes.
import { menuVersion, bumpMenuVersion } from "@/lib/menuVersion";

// GET /api/menu-version?v=CLIENT_VERSION
// Returns { current: N, changed: boolean }
// Client passes its last known version, we say if it changed.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientVersion = parseInt(searchParams.get("v") || "0");
  return NextResponse.json({
    current: menuVersion,
    changed: menuVersion !== clientVersion,
  });
}
