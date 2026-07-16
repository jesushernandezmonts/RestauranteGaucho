import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/inventario - all ingredients
export async function GET() {
  try {
    const movimientos = await prisma.inventarioMovimiento.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { ingrediente: { select: { nombre: true } } },
    });

    const ingredientes = await prisma.ingrediente.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ ingredientes, movimientos });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// PATCH /api/inventario - update stock
export async function PATCH(request: Request) {
  try {
    const { id, stock, stockMinimo, nombre, unidad, costoSugerido } = await request.json();
    const data: Record<string, unknown> = {};
    if (stock !== undefined) data.stock = stock;
    if (stockMinimo !== undefined) data.stockMinimo = stockMinimo;
    if (nombre !== undefined) data.nombre = nombre;
    if (unidad !== undefined) data.unidad = unidad;
    if (costoSugerido !== undefined) data.costoSugerido = costoSugerido;

    const ing = await prisma.ingrediente.update({ where: { id }, data });
    return NextResponse.json(ing);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// POST /api/inventario - create ingredient
export async function POST(request: Request) {
  try {
    const { nombre, unidad, stock, stockMinimo, costoSugerido } = await request.json();
    const ing = await prisma.ingrediente.create({
      data: { nombre, unidad: unidad || "pieza", stock: stock || 0, stockMinimo: stockMinimo || 10, costoSugerido: costoSugerido || 0 },
    });
    return NextResponse.json(ing, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// DELETE /api/inventario - delete ingredient (cascades recipes & movements)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    // Remove associated recipes so the ingredient can be deleted
    await prisma.receta.deleteMany({ where: { ingredienteId: id } });
    // Remove inventory movements referencing this ingredient
    await prisma.inventarioMovimiento.deleteMany({ where: { ingredienteId: id } });
    await prisma.ingrediente.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
