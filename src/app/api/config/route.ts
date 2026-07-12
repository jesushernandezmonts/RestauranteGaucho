import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/config - get all config keys as { [clave]: valor }
export async function GET() {
  try {
    const configs = await prisma.configuracion.findMany();
    const map: Record<string, string> = {};
    for (const c of configs) {
      map[c.clave] = c.valor;
    }
    return NextResponse.json(map);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json({ error: "Error al cargar configuración" }, { status: 500 });
  }
}

// PUT /api/config - update one or more config keys
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const entries = Object.entries(body);
    for (const [clave, valor] of entries) {
      if (typeof valor !== "string") continue;
      await prisma.configuracion.upsert({
        where: { clave },
        update: { valor },
        create: { clave, valor },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}
