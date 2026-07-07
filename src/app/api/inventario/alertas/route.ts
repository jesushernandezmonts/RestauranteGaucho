import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/inventario/alertas - ingredients with low stock
export async function GET() {
  try {
    const ingredientes = await prisma.ingrediente.findMany({
      where: {
        stock: {
          lte: prisma.ingrediente.fields.stockMinimo,
        },
      },
      orderBy: { stock: "asc" },
    });
    return NextResponse.json(ingredientes);
  } catch (error) {
    console.error("Error fetching inventory alerts:", error);
    return NextResponse.json(
      { error: "Error al cargar alertas" },
      { status: 500 }
    );
  }
}
