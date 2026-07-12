import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const promo = await prisma.promocion.update({
      where: { id: parseInt(id) },
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion,
        descuento: body.descuento,
        imagen: body.imagen,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : body.fechaFin === null ? null : undefined,
        activo: body.activo,
        destacado: body.destacado,
      },
    });
    return NextResponse.json(promo);
  } catch (error) {
    console.error("Error updating promo:", error);
    return NextResponse.json({ error: "Error al actualizar promoción" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.promocion.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting promo:", error);
    return NextResponse.json({ error: "Error al eliminar promoción" }, { status: 500 });
  }
}
