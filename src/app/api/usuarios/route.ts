import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/usuarios
export async function GET() {
  try {
    const usuarios = await prisma.user.findMany({
      select: { id: true, nombre: true, usuario: true, role: true, activo: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// POST /api/usuarios
export async function POST(request: Request) {
  try {
    const { nombre, usuario, password, role } = await request.json();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nombre, usuario, passwordHash, role: role || "MESERO" },
    });
    return NextResponse.json({ id: user.id, nombre: user.nombre, usuario: user.usuario, role: user.role }, { status: 201 });
  } catch (error) {
    console.error("Error creating usuario:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}

// PATCH /api/usuarios
export async function PATCH(request: Request) {
  try {
    const { id, nombre, usuario, role, activo } = await request.json();
    const data: Record<string, unknown> = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (usuario !== undefined) data.usuario = usuario;
    if (role !== undefined) data.role = role;
    if (activo !== undefined) data.activo = activo;
    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating usuario:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
