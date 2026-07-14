import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpMenuVersion } from "@/lib/menuVersion";
import { auth } from "@/lib/auth";
import { sendPushToAll } from "@/lib/push";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mesaId = searchParams.get("mesaId");
    const estado = searchParams.get("estado");
    const forKitchen = searchParams.get("forKitchen") === "true";

    const where: Record<string, unknown> = {};
    if (mesaId) where.mesaId = parseInt(mesaId);
    if (estado) where.estado = estado;
    if (forKitchen) {
      where.estado = {
        in: ["EN_COCINA", "PREPARANDO", "LISTO"],
      };
    }

    const ordenes = await prisma.orden.findMany({
      where,
      include: {
        mesa: true,
        mesero: { select: { id: true, nombre: true } },
        detalle: {
          include: {
            platillo: { select: { id: true, nombre: true, precio: true } },
            extras: true,
            opciones: true,
          },
        },
        pagos: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ordenes);
  } catch (error) {
    console.error("Error fetching ordenes:", error);
    return NextResponse.json(
      { error: "Error al cargar órdenes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { mesaId, items } = body;

    if (!mesaId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Mesa y platillos requeridos" },
        { status: 400 }
      );
    }

    let total = 0;
    const detallesData = items.map(
      (item: {
        platilloId: number;
        cantidad: number;
        subtotal: number;
        extras?: { nombre: string; precio: number }[];
        opciones?: { tipo: "QUITAR" | "NOTA"; valor: string }[];
      }) => {
        total += item.subtotal;
        return {
          platilloId: item.platilloId,
          cantidad: item.cantidad || 1,
          subtotal: item.subtotal,
          extras: item.extras
            ? {
                create: item.extras.map((e) => ({
                  nombre: e.nombre,
                  precio: e.precio,
                })),
              }
            : undefined,
          opciones: item.opciones
            ? {
                create: item.opciones.map((o) => ({
                  tipo: o.tipo,
                  valor: o.valor,
                })),
              }
            : undefined,
        };
      }
    );

    const orden = await prisma.orden.create({
      data: {
        mesaId,
        meseroId: session.user.id,
        estado: "EN_COCINA",
        total,
        detalle: {
          create: detallesData,
        },
      },
      include: {
        mesa: true,
        mesero: { select: { id: true, nombre: true } },
        detalle: {
          include: {
            platillo: { select: { id: true, nombre: true, precio: true } },
            extras: true,
            opciones: true,
          },
        },
      },
    });

    // Update mesa status
    await prisma.mesa.update({
      where: { id: mesaId },
      data: { estado: "OCUPADO" },
    });

    bumpMenuVersion();

    // Auto-deduct inventory for each item in order
    for (const item of items) {
      const recetas = await prisma.receta.findMany({
        where: { platilloId: item.platilloId },
        include: { ingrediente: true },
      });
      for (const receta of recetas) {
        const cantidadDescontar = receta.cantidad * (item.cantidad || 1);
        await prisma.ingrediente.update({
          where: { id: receta.ingredienteId },
          data: { stock: { decrement: cantidadDescontar } },
        });
        await prisma.inventarioMovimiento.create({
          data: {
            ingredienteId: receta.ingredienteId,
            tipo: "SALIDA",
            cantidad: cantidadDescontar,
            referencia: `Orden #${orden.id} - ${item.platilloId}`,
          },
        });
      }
    }

    // Notify push subscribers (chef devices)
    notifyKitchenNewOrder(orden);

    return NextResponse.json(orden, { status: 201 });
  } catch (error) {
    console.error("Error creating orden:", error);
    return NextResponse.json(
      { error: "Error al crear la orden" },
      { status: 500 }
    );
  }
}

// Después de crear orden, enviar push a cocina
async function notifyKitchenNewOrder(orden: { id: number; mesa: { numero: number }; detalle: { cantidad: number; platillo: { nombre: string } }[] }) {
  try {
    const items = orden.detalle.map((d) => `${d.cantidad}x ${d.platillo.nombre}`).join(", ");
    await sendPushToAll({
      title: "🍳 Nueva orden",
      body: `Mesa ${orden.mesa.numero} — ${items}`,
      tag: "nueva-orden",
      url: "/cocina",
    });
  } catch {
    // Silently fail
  }
}

// PATCH - Update order status (chef)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estado, ...rest } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { error: "ID y estado requeridos" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { estado };

    // If closing the order
    if (rest.metodoPago) {
      updateData.metodoPago = rest.metodoPago;
      updateData.total = rest.total;
      updateData.propina = rest.propina || 0;
      updateData.tipoPropina = rest.tipoPropina || "";
      updateData.cerradaPor = rest.cerradaPor;
      updateData.closedAt = new Date();
    }

    const orden = await prisma.orden.update({
      where: { id },
      data: updateData,
    });

    // If the order is being served, free the table
    if (estado === "SERVIDO") {
      await prisma.mesa.update({
        where: { id: orden.mesaId },
        data: { estado: "LIBRE" },
      });
    }

    // If the order is marked as ready, notify waitstaff
    if (estado === "LISTO") {
      const ordenCompleta = await prisma.orden.findUnique({
        where: { id },
        include: {
          mesa: true,
          detalle: {
            include: {
              platillo: { select: { nombre: true } },
            },
          },
        },
      });
      if (ordenCompleta) {
        const items = ordenCompleta.detalle.map((d) => `${d.cantidad}x ${d.platillo.nombre}`).join(", ");
        await sendPushToAll({
          title: "✅ Orden lista",
          body: `Mesa ${ordenCompleta.mesa.numero} — ${items}`,
          tag: "orden-lista",
          url: "/mesero",
        });
      }
    }

    return NextResponse.json(orden);
  } catch (error) {
    console.error("Error updating orden:", error);
    return NextResponse.json(
      { error: "Error al actualizar la orden" },
      { status: 500 }
    );
  }
}
