import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const promos = await prisma.promocion.findMany({
      where: {
        activo: true,
        fechaInicio: { lte: now },
        OR: [{ fechaFin: null }, { fechaFin: { gte: now } }],
      },
      orderBy: { destacado: "desc" },
    });
    return NextResponse.json(promos);
  } catch (error) {
    console.error("Error fetching promos:", error);
    return NextResponse.json({ error: "Error al cargar promociones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const promo = await prisma.promocion.create({
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion || "",
        descuento: body.descuento || "",
        imagen: body.imagen || "",
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : new Date(),
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : null,
        activo: body.activo ?? true,
        destacado: body.destacado ?? false,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (error) {
    console.error("Error creating promo:", error);
    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 });
  }
}
