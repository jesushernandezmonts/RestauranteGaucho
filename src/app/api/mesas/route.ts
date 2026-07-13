import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mesas = await prisma.mesa.findMany({
      orderBy: { numero: "asc" },
      include: {
        _count: {
          select: {
            ordenes: {
              where: { estado: "LISTO" },
            },
          },
        },
      },
    });
    return NextResponse.json(mesas);
  } catch (error) {
    console.error("Error fetching mesas:", error);
    return NextResponse.json({ error: "Error al cargar mesas" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { error: "ID y estado son requeridos" },
        { status: 400 }
      );
    }

    const mesa = await prisma.mesa.update({
      where: { id },
      data: { estado },
    });

    return NextResponse.json(mesa);
  } catch (error) {
    console.error("Error updating mesa:", error);
    return NextResponse.json(
      { error: "Error al actualizar mesa" },
      { status: 500 }
    );
  }
}
