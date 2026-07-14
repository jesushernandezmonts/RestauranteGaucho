
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  context: any
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = Number(context.params.id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
  }

  try {
    // Asegurarse de que el admin no se elimine a sí mismo (opcional pero recomendado)
    if (Number(session.user.id) === userId) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}
