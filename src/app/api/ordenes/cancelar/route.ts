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

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { ordenId, detalleOrdenId, motivo = "Sin motivo especificado" } = body;

    if (!ordenId) {
      return NextResponse.json(
        { error: "Se requiere ID de la orden" },
        { status: 400 }
      );
    }

    const orden = await prisma.orden.findUnique({
      where: { id: ordenId },
      include: {
        detalle: {
          include: {
            platillo: true,
          },
        },
        mesa: true,
      },
    });

    if (!orden) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    if (orden.estado === "CERRADA" || orden.estado === "CANCELADA") {
      return NextResponse.json(
        { error: "No se puede cancelar una orden ya cerrada o cancelada" },
        { status: 400 }
      );
    }

    // CASO 1: Cancelación de un Platillo Individual
    if (detalleOrdenId) {
      const detalle = orden.detalle.find((d) => d.id === detalleOrdenId);

      if (!detalle) {
        return NextResponse.json(
          { error: "Platillo no encontrado en esta orden" },
          { status: 404 }
        );
      }

      if (detalle.cancelado) {
        return NextResponse.json(
          { error: "Este platillo ya se encuentra cancelado" },
          { status: 400 }
        );
      }

      // Marcar platillo cancelado y recalcular total de orden
      await prisma.detalleOrden.update({
        where: { id: detalleOrdenId },
        data: {
          cancelado: true,
          motivoCancelacion: motivo,
        },
      });

      const nuevoTotal = Math.max(0, orden.total - detalle.subtotal);

      // Devolver insumos a inventario
      const recetas = await prisma.receta.findMany({
        where: { platilloId: detalle.platilloId },
      });

      for (const receta of recetas) {
        const cantidadDevolver = receta.cantidad * detalle.cantidad;
        await prisma.ingrediente.update({
          where: { id: receta.ingredienteId },
          data: { stock: { increment: cantidadDevolver } },
        });

        await prisma.inventarioMovimiento.create({
          data: {
            ingredienteId: receta.ingredienteId,
            tipo: "ENTRADA",
            cantidad: cantidadDevolver,
            referencia: `Devolución por Cancelación Orden #${ordenId} - ${detalle.platillo.nombre}`,
          },
        });
      }

      // Bitácora de auditoría
      await prisma.auditoriaCancelacion.create({
        data: {
          usuarioId: userId,
          ordenId,
          detalleOrdenId,
          platilloNombre: detalle.platillo.nombre,
          cantidad: detalle.cantidad,
          montoPerdido: detalle.subtotal,
          motivo,
        },
      });

      // Verificar si todos los ítems de la orden quedaron cancelados
      const detallesActualizados = await prisma.detalleOrden.findMany({
        where: { ordenId },
      });

      const todosCancelados = detallesActualizados.every((d) => d.cancelado);

      let estadoOrden: OrdenEstado = orden.estado;
      if (todosCancelados) {
        estadoOrden = OrdenEstado.CANCELADA;
        await prisma.mesa.update({
          where: { id: orden.mesaId },
          data: { estado: "LIBRE" },
        });
      }

      await prisma.orden.update({
        where: { id: ordenId },
        data: {
          total: nuevoTotal,
          estado: estadoOrden,
          motivoCancelacion: todosCancelados ? motivo : orden.motivoCancelacion,
        },
      });

      bumpMenuVersion();

      return NextResponse.json({
        message: todosCancelados
          ? "Orden totalmente cancelada por cancelación de todos los platillos"
          : "Platillo cancelado e insumos devueltos al inventario",
        nuevoTotal,
        todosCancelados,
      });
    }

    // CASO 2: Cancelación de la Orden Completa
    for (const detalle of orden.detalle) {
      if (!detalle.cancelado) {
        // Marcar detalle cancelado
        await prisma.detalleOrden.update({
          where: { id: detalle.id },
          data: { cancelado: true, motivoCancelacion: motivo },
        });

        // Devolver insumos
        const recetas = await prisma.receta.findMany({
          where: { platilloId: detalle.platilloId },
        });

        for (const receta of recetas) {
          const cantidadDevolver = receta.cantidad * detalle.cantidad;
          await prisma.ingrediente.update({
            where: { id: receta.ingredienteId },
            data: { stock: { increment: cantidadDevolver } },
          });

          await prisma.inventarioMovimiento.create({
            data: {
              ingredienteId: receta.ingredienteId,
              tipo: "ENTRADA",
              cantidad: cantidadDevolver,
              referencia: `Devolución Cancelación Total Orden #${ordenId} - ${detalle.platillo.nombre}`,
            },
          });
        }

        // Bitácora de auditoría por ítem
        await prisma.auditoriaCancelacion.create({
          data: {
            usuarioId: userId,
            ordenId,
            detalleOrdenId: detalle.id,
            platilloNombre: detalle.platillo.nombre,
            cantidad: detalle.cantidad,
            montoPerdido: detalle.subtotal,
            motivo,
          },
        });
      }
    }

    // Marcar orden cancelada y liberar mesa
    await prisma.orden.update({
      where: { id: ordenId },
      data: {
        estado: OrdenEstado.CANCELADA,
        motivoCancelacion: motivo,
      },
    });

    await prisma.mesa.update({
      where: { id: orden.mesaId },
      data: { estado: "LIBRE" },
    });

    bumpMenuVersion();

    return NextResponse.json({
      message: "Orden cancelada exitosamente e insumos devueltos.",
    });
  } catch (error) {
    console.error("Error al cancelar orden/platillo:", error);
    return NextResponse.json(
      { error: "Error al procesar la cancelación" },
      { status: 500 }
    );
  }
}
