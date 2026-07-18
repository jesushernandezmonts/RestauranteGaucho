import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpMenuVersion } from "@/lib/menuVersion";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { orden: "asc" },
      include: { _count: { select: { platillos: true } } },
    });
    return NextResponse.json(categorias);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error fetching categories:", { message });
    return NextResponse.json(
      { error: `Error al obtener categorías: ${message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, icono, orden } = await request.json();
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la categoría es requerido" },
        { status: 400 }
      );
    }
    const cat = await prisma.categoria.create({
      data: { nombre: nombre.trim(), icono: icono || "🍽️", orden: orden || 0 },
    });
    bumpMenuVersion();
    return NextResponse.json(cat, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error creating category:", {
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: `Error al crear categoría: ${message}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, nombre, icono, orden } = await request.json();
    const data: Record<string, unknown> = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (icono !== undefined) data.icono = icono;
    if (orden !== undefined) data.orden = orden;
    const cat = await prisma.categoria.update({ where: { id }, data });
    bumpMenuVersion();
    return NextResponse.json(cat);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error updating category:", { message });
    return NextResponse.json(
      { error: `Error al actualizar categoría: ${message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de categoría no proporcionado" },
        { status: 400 }
      );
    }

    const categoryId = parseInt(id, 10);

    const count = await prisma.platillo.count({
      where: { categoriaId: categoryId },
    });
    if (count > 0) {
      return NextResponse.json(
        { error: "Categoría tiene platillos, no se puede eliminar" },
        { status: 400 }
      );
    }
    const cat = await prisma.categoria.delete({ where: { id: categoryId } });
    bumpMenuVersion();
    return NextResponse.json(cat);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error deleting category:", { message });
    return NextResponse.json(
      { error: `Error al eliminar categoría: ${message}` },
      { status: 500 }
    );
  }
}
