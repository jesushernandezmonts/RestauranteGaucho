import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservaciones = await prisma.reservacion.findMany({
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(reservaciones);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, telefono, email, fecha, hora, personas, notas } = await request.json();
    const reservacion = await prisma.reservacion.create({
      data: {
        nombre,
        telefono: telefono || "",
        email: email || "",
        fecha: new Date(fecha),
        hora,
        personas: personas || 2,
        notas: notas || "",
      },
    });
    return NextResponse.json(reservacion, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al crear reservación" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, estado } = await request.json();
    const res = await prisma.reservacion.update({ where: { id }, data: { estado } });
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.reservacion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
