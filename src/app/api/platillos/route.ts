import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpMenuVersion } from "@/app/api/menu-version/route";

// GET /api/platillos - full menu with categories
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { orden: "asc" },
      include: {
        platillos: {
          orderBy: { id: "asc" },
          include: {
            _count: { select: { receta: true } },
          },
        },
        _count: { select: { platillos: true } },
      },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error fetching platillos:", error);
    return NextResponse.json({ error: "Error al cargar menú" }, { status: 500 });
  }
}

// POST /api/platillos - create a new dish
export async function POST(request: Request) {
  try {
    const { nombre, descripcion, precio, categoriaId } = await request.json();
    if (!nombre || !precio || !categoriaId) {
      return NextResponse.json({ error: "Nombre, precio y categoría requeridos" }, { status: 400 });
    }
    const platillo = await prisma.platillo.create({
      data: { nombre, descripcion: descripcion || "", precio, categoriaId },
    });
    bumpMenuVersion();
    return NextResponse.json(platillo, { status: 201 });
  } catch (error) {
    console.error("Error creating platillo:", error);
    return NextResponse.json({ error: "Error al crear platillo" }, { status: 500 });
  }
}

// PATCH /api/platillos - update a dish
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, nombre, precio, activo, descripcion } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (precio !== undefined) updateData.precio = precio;
    if (activo !== undefined) updateData.activo = activo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;

    const platillo = await prisma.platillo.update({
      where: { id },
      data: updateData,
    });
    bumpMenuVersion();
    return NextResponse.json(platillo);
  } catch (error) {
    console.error("Error updating platillo:", error);
    return NextResponse.json(
      { error: "Error al actualizar platillo" },
      { status: 500 }
    );
  }
}
