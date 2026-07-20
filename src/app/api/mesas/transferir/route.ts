import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { bumpMenuVersion } from "@/lib/menuVersion";
import { OrdenEstado } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { origenMesaId, destinoMesaId } = await request.json();

    if (!origenMesaId || !destinoMesaId || origenMesaId === destinoMesaId) {
      return NextResponse.json(
        { error: "Mesas de origen y destino válidas son requeridas." },
        { status: 400 }
      );
    }

    // 1. Obtener datos de mesas
    const [origenMesa, destinoMesa] = await Promise.all([
      prisma.mesa.findUnique({ where: { id: origenMesaId } }),
      prisma.mesa.findUnique({ where: { id: destinoMesaId } }),
    ]);

    if (!origenMesa || !destinoMesa) {
      return NextResponse.json(
        { error: "Mesa de origen o destino no encontrada" },
        { status: 404 }
      );
    }

    // 2. Obtener la orden activa de la mesa de origen
    const ordenOrigen = await prisma.orden.findFirst({
      where: {
        mesaId: origenMesaId,
        estado: { notIn: ["CERRADA", "CANCELADA"] },
      },
      include: { detalle: true },
    });

    if (!ordenOrigen) {
      return NextResponse.json(
        { error: `No hay consumos activos en la Mesa #${origenMesa.numero}` },
        { status: 400 }
      );
    }

    // 3. Obtener la orden activa de la mesa de destino (si existe)
    const ordenDestino = await prisma.orden.findFirst({
      where: {
        mesaId: destinoMesaId,
        estado: { notIn: ["CERRADA", "CANCELADA"] },
      },
    });

    // CASO 1: La mesa destino está LIBRE (Mover la mesa)
    if (!ordenDestino) {
      await prisma.orden.update({
        where: { id: ordenOrigen.id },
        data: { mesaId: destinoMesaId },
      });

      await prisma.mesa.update({
        where: { id: origenMesaId },
        data: { estado: "LIBRE" },
      });

      await prisma.mesa.update({
        where: { id: destinoMesaId },
        data: { estado: "OCUPADO" },
      });

      bumpMenuVersion();

      return NextResponse.json({
        message: `Mesa #${origenMesa.numero} movida exitosamente a la Mesa #${destinoMesa.numero}`,
        tipo: "mover",
      });
    }

    // CASO 2: La mesa destino está OCUPADA (Fusionar comandas)
    // Transferir todos los detalles de la orden origen a la orden destino
    await prisma.detalleOrden.updateMany({
      where: { ordenId: ordenOrigen.id },
      data: { ordenId: ordenDestino.id },
    });

    // Sumar el total de la orden de destino
    const nuevoTotalDestino = ordenDestino.total + ordenOrigen.total;

    await prisma.orden.update({
      where: { id: ordenDestino.id },
      data: { total: nuevoTotalDestino },
    });

    // Cancelar la orden origen indicando que fue fusionada
    await prisma.orden.update({
      where: { id: ordenOrigen.id },
      data: {
        estado: OrdenEstado.CANCELADA,
        motivoCancelacion: `Fusionada con la Mesa #${destinoMesa.numero}`,
      },
    });

    // Liberar mesa de origen y asegurar ocupada en destino
    await prisma.mesa.update({
      where: { id: origenMesaId },
      data: { estado: "LIBRE" },
    });

    await prisma.mesa.update({
      where: { id: destinoMesaId },
      data: { estado: "OCUPADO" },
    });

    bumpMenuVersion();

    return NextResponse.json({
      message: `Consumos de la Mesa #${origenMesa.numero} fusionados en la Mesa #${destinoMesa.numero}`,
      tipo: "fusionar",
    });
  } catch (error) {
    console.error("Error al transferir mesa:", error);
    return NextResponse.json(
      { error: "Error interno al transferir la mesa." },
      { status: 500 }
    );
  }
}
