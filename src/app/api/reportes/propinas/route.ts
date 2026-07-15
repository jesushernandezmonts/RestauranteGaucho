import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const meseroIdParam = searchParams.get("meseroId");
    const metodoPagoParam = searchParams.get("metodoPago");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    const meseroId = meseroIdParam ? parseInt(meseroIdParam, 10) : undefined;

    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      whereClause.createdAt = {
        gte: startDate,
      };
    } else if (endDate) {
      whereClause.createdAt = {
        lte: endDate,
      };
    }

    if (meseroId) {
      whereClause.meseroId = meseroId;
    }

    // Fetch payments based on filters for total tips
    const pagos = await prisma.pago.findMany({
      where: {
        createdAt: whereClause.createdAt,
        meseroId: whereClause.meseroId,
        metodo: metodoPagoParam && metodoPagoParam !== "Todos" ? metodoPagoParam : undefined,
      },
      select: {
        monto: true,
        propina: true,
        metodo: true,
        mesero: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    let totalPropinas = 0;
    let totalPropinasEfectivo = 0;
    let totalPropinasTarjeta = 0;

    const propinasPorMesero: {
      [key: number]: {
        meseroId: number;
        nombre: string;
        propinasTotal: number;
        ordenesCerradas: number;
        ventasTotales: number;
      };
    } = {};

    pagos.forEach((pago) => {
      totalPropinas += pago.propina;
      if (pago.metodo === "efectivo") {
        totalPropinasEfectivo += pago.propina;
      } else if (pago.metodo === "tarjeta") {
        totalPropinasTarjeta += pago.propina;
      }

      if (pago.mesero) {
        if (!propinasPorMesero[pago.mesero.id]) {
          propinasPorMesero[pago.mesero.id] = {
            meseroId: pago.mesero.id,
            nombre: pago.mesero.nombre,
            propinasTotal: 0,
            ordenesCerradas: 0,
            ventasTotales: 0,
          };
        }
        propinasPorMesero[pago.mesero.id].propinasTotal += pago.propina;
      }
    });

    // Fetch orders for mesero performance metrics
    const orders = await prisma.orden.findMany({
      where: {
        createdAt: whereClause.createdAt,
        meseroId: whereClause.meseroId,
        estado: "CERRADA", // Solo órdenes cerradas
      },
      select: {
        id: true,
        meseroId: true,
        total: true,
        propina: true,
        mesero: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    orders.forEach((orden) => {
        const meseroNombre = orden.mesero?.nombre || "Desconocido";
        if (!propinasPorMesero[orden.meseroId]) {
          propinasPorMesero[orden.meseroId] = {
            meseroId: orden.meseroId,
            nombre: meseroNombre,
            propinasTotal: 0,
            ordenesCerradas: 0,
            ventasTotales: 0,
          };
        }
        propinasPorMesero[orden.meseroId].ordenesCerradas += 1;
        propinasPorMesero[orden.meseroId].ventasTotales += orden.total;
        // Also accumulate the order's propina into the waiter's total
        propinasPorMesero[orden.meseroId].propinasTotal += orden.propina || 0;
    });

    const meserosConMetricas = Object.values(propinasPorMesero).map((mesero) => ({
      ...mesero,
      propinaPromedioPorOrden: mesero.ordenesCerradas > 0 ? mesero.propinasTotal / mesero.ordenesCerradas : 0,
    }));


    return NextResponse.json({
      resumen: {
        totalPropinas,
        totalPropinasEfectivo,
        totalPropinasTarjeta,
      },
      propinasPorMesero: meserosConMetricas,
      detallePagos: pagos.map(p => ({
        id: p.mesero?.id,
        nombre: p.mesero?.nombre,
        propina: p.propina,
        metodo: p.metodo,
      })),
      detalleOrdenes: orders.map(o => ({
        id: o.id,
        meseroId: o.meseroId,
        total: o.total,
        propina: o.propina,
      }))
    });
  } catch (error) {
    console.error("Error fetching tip reports:", error);
    return NextResponse.json({ error: "Error fetching tip reports" }, { status: 500 });
  }
}
