import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpMenuVersion } from "@/lib/menuVersion";

// GET /api/platillos - full menu with categories
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { orden: "asc" },
      include: {
        platillos: {
          orderBy: [{ orden: "asc" }, { id: "asc" }],
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            precio: true,
            activo: true,
            imagen: true,
            ingredientesDestacados: true,
            orden: true,
            categoriaId: true,
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
    const { nombre, descripcion, precio, categoriaId, imagen, ingredientesDestacados } = await request.json();
    if (!nombre || !precio || !categoriaId) {
      return NextResponse.json({ error: "Nombre, precio y categoría requeridos" }, { status: 400 });
    }
    const platillo = await prisma.platillo.create({
      data: { nombre, descripcion: descripcion || "", precio, categoriaId, imagen: imagen || "", ingredientesDestacados: ingredientesDestacados || "" },
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
    const { id, nombre, precio, activo, descripcion, imagen, orden, categoriaId } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (precio !== undefined) updateData.precio = precio;
    if (activo !== undefined) updateData.activo = activo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (imagen !== undefined) updateData.imagen = imagen;
    if (orden !== undefined) updateData.orden = orden;
    if (categoriaId !== undefined) updateData.categoriaId = categoriaId;
    if (body.ingredientesDestacados !== undefined) updateData.ingredientesDestacados = body.ingredientesDestacados;

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

// DELETE /api/platillos - delete a dish
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Delete related records first
    await prisma.opcionOrden.deleteMany({
      where: { detalleOrden: { platilloId: parseInt(id) } },
    });
    await prisma.extraOrden.deleteMany({
      where: { detalleOrden: { platilloId: parseInt(id) } },
    });
    await prisma.detalleOrden.deleteMany({
      where: { platilloId: parseInt(id) },
    });
    await prisma.receta.deleteMany({
      where: { platilloId: parseInt(id) },
    });
    await prisma.platillo.delete({
      where: { id: parseInt(id) },
    });

    bumpMenuVersion();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting platillo:", error);
    return NextResponse.json(
      { error: "Error al eliminar platillo" },
      { status: 500 }
    );
  }
}
