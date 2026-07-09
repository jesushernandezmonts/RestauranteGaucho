import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { dataUrl } = await request.json();

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Se requiere una imagen válida en base64" }, { status: 400 });
    }

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ error: "Error al procesar imagen" }, { status: 500 });
  }
}
