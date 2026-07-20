import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Obtener las ventas acumuladas desde el último corte de caja
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 1. Encontrar la fecha del último corte de caja
    const ultimoCorte = await prisma.corteCaja.findFirst({
      orderBy: { fechaFin: "desc" },
    });

    const fechaInicio = ultimoCorte ? ultimoCorte.fechaFin : new Date(0);

    // 2. Buscar todas las órdenes CERRADAS a partir de fechaInicio
    const ordenesTurno = await prisma.orden.findMany({
      where: {
        estado: "CERRADA",
        closedAt: {
          gte: fechaInicio,
        },
      },
      include: {
        mesero: { select: { id: true, nombre: true } },
        pagos: true,
      },
      orderBy: { closedAt: "desc" },
    });

    // 3. Calcular totales
    let ventasEfectivo = 0;
    let ventasTarjeta = 0;
    let totalPropinas = 0;
    let totalVentas = 0;

    for (const orden of ordenesTurno) {
      totalVentas += orden.total;
      totalPropinas += orden.propina || 0;

      if (orden.metodoPago === "efectivo") {
        ventasEfectivo += orden.total;
      } else if (orden.metodoPago === "tarjeta") {
        ventasTarjeta += orden.total;
      } else {
        // En caso de que no tenga metodoPago especificado en Orden pero sí en Pago
        for (const pago of orden.pagos) {
          if (pago.metodo === "efectivo") ventasEfectivo += pago.monto;
          else ventasTarjeta += pago.monto;
        }
      }
    }

    // 4. Obtener historial de últimos 10 cortes
    const historialCortes = await prisma.corteCaja.findMany({
      include: {
        usuario: { select: { nombre: true } },
      },
      orderBy: { fechaFin: "desc" },
      take: 10,
    });

    return NextResponse.json({
      turnoActual: {
        fechaInicio,
        ventasEfectivo,
        ventasTarjeta,
        totalVentas,
        totalPropinas,
        totalOrdenes: ordenesTurno.length,
        ordenes: ordenesTurno,
      },
      historialCortes,
    });
  } catch (error) {
    console.error("Error al obtener datos de corte de caja:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Registrar un nuevo Corte de Caja (Manual Admin)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado. Se requieren permisos de Admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { montoInicial = 0, efectivoReal = 0, notas = "" } = body;

    // 1. Obtener la fecha de inicio del turno actual
    const ultimoCorte = await prisma.corteCaja.findFirst({
      orderBy: { fechaFin: "desc" },
    });

    const fechaInicio = ultimoCorte ? ultimoCorte.fechaFin : new Date(0);
    const fechaFin = new Date();

    // 2. Recalcular métricas exactas del periodo
    const ordenesTurno = await prisma.orden.findMany({
      where: {
        estado: "CERRADA",
        closedAt: {
          gte: fechaInicio,
        },
      },
      include: { pagos: true },
    });

    let ventasEfectivo = 0;
    let ventasTarjeta = 0;
    let totalPropinas = 0;
    let totalVentas = 0;

    for (const orden of ordenesTurno) {
      totalVentas += orden.total;
      totalPropinas += orden.propina || 0;

      if (orden.metodoPago === "efectivo") {
        ventasEfectivo += orden.total;
      } else if (orden.metodoPago === "tarjeta") {
        ventasTarjeta += orden.total;
      } else {
        for (const pago of orden.pagos) {
          if (pago.metodo === "efectivo") ventasEfectivo += pago.monto;
          else ventasTarjeta += pago.monto;
        }
      }
    }

    const efectivoEsperado = montoInicial + ventasEfectivo;
    const diferencia = efectivoReal - efectivoEsperado;

    // 3. Crear el registro atómico de Corte de Caja
    const nuevoCorte = await prisma.corteCaja.create({
      data: {
        usuarioId: parseInt(session.user.id),
        fechaInicio,
        fechaFin,
        montoInicial,
        ventasEfectivo,
        ventasTarjeta,
        totalVentas,
        totalPropinas,
        efectivoReal,
        diferencia,
        notas,
      },
      include: {
        usuario: { select: { nombre: true } },
      },
    });

    return NextResponse.json(nuevoCorte, { status: 201 });
  } catch (error) {
    console.error("Error al registrar corte de caja:", error);
    return NextResponse.json(
      { error: "Error al registrar el corte de caja" },
      { status: 500 }
    );
  }
}
