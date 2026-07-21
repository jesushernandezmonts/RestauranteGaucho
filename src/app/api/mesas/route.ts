import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Asegurar que las mesas 11, 12, 13, 14 existan y tengan área "Exterior"
    const targetNumeros = [11, 12, 13, 14];
    await Promise.all(
      targetNumeros.map((num) =>
        prisma.mesa.upsert({
          where: { numero: num },
          update: { area: "Exterior" },
          create: { numero: num, capacidad: 4, area: "Exterior", estado: "LIBRE" },
        })
      )
    );

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
    const { id, estado, area, numero } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (estado !== undefined) updateData.estado = estado;
    if (area !== undefined) updateData.area = area;
    if (numero !== undefined) updateData.numero = numero;

    const mesa = await prisma.mesa.update({
      where: { id },
      data: updateData,
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
