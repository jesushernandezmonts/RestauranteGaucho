import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpMenuVersion } from "@/app/api/menu-version/route";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { orden: "asc" },
      include: { _count: { select: { platillos: true } } },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, icono, orden } = await request.json();
    const cat = await prisma.categoria.create({ data: { nombre, icono: icono || "🍽️", orden: orden || 0 } });
    bumpMenuVersion();
    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
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
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de categoría no proporcionado" }, { status: 400 });
    }

    const categoryId = parseInt(id, 10); // Convertir el ID a número

    const count = await prisma.platillo.count({ where: { categoriaId: categoryId } });
    if (count > 0) {
      return NextResponse.json({ error: "Categoría tiene platillos, no se puede eliminar" }, { status: 400 });
    }
    const cat = await prisma.categoria.delete({ where: { id: categoryId } });
    bumpMenuVersion();
    return NextResponse.json(cat);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
