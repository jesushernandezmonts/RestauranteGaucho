import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/platillos/[id]/receta - get recipe for a dish
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const platilloId = parseInt(id);

    const receta = await prisma.receta.findMany({
      where: { platilloId },
      include: {
        ingrediente: {
          select: { id: true, nombre: true, unidad: true, stock: true },
        },
      },
    });

    const platillo = await prisma.platillo.findUnique({
      where: { id: platilloId },
      select: { id: true, nombre: true },
    });

    return NextResponse.json({ platillo, receta });
  } catch (error) {
    console.error("Error fetching receta:", error);
    return NextResponse.json({ error: "Error al cargar receta" }, { status: 500 });
  }
}

// PUT /api/platillos/[id]/receta - save full recipe (replace all ingredients)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const platilloId = parseInt(id);
    const body = await request.json();
    const { ingredientes } = body; // [{ ingredienteId, cantidad }]

    if (!Array.isArray(ingredientes)) {
      return NextResponse.json(
        { error: "ingredientes debe ser un array" },
        { status: 400 }
      );
    }

    // Delete existing recipe entries for this dish
    await prisma.receta.deleteMany({ where: { platilloId } });

    // Create new entries
    for (const ing of ingredientes) {
      await prisma.receta.create({
        data: {
          platilloId,
          ingredienteId: ing.ingredienteId,
          cantidad: ing.cantidad,
        },
      });
    }

    const receta = await prisma.receta.findMany({
      where: { platilloId },
      include: {
        ingrediente: {
          select: { id: true, nombre: true, unidad: true },
        },
      },
    });

    return NextResponse.json({ receta });
  } catch (error) {
    console.error("Error saving receta:", error);
    return NextResponse.json({ error: "Error al guardar receta" }, { status: 500 });
  }
}
