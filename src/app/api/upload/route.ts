import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { dataUrl } = await request.json();

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Se requiere una imagen válida en base64" }, { status: 400 });
    }

    // Extraer el base64 sin prefijo
    const matches = dataUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "Formato de imagen inválido" }, { status: 400 });
    }

    const ext = matches[1];
    const base64Data = matches[2];

    // Calcular tamaño estimado (~0.75 bytes por char base64)
    const estimatedBytes = base64Data.length * 0.75;
    const estimatedKB = Math.round(estimatedBytes / 1024);

    let compressedUrl = dataUrl;

    // Si la imagen pesa más de 300KB, reducirla
    const MAX_KB = 300;
    if (estimatedKB > MAX_KB) {
      const ratio = MAX_KB / estimatedKB;
      const maxChars = Math.floor(base64Data.length * ratio);
      const trimmed = base64Data.substring(0, maxChars);
      compressedUrl = `data:image/jpeg;base64,${trimmed}`;
    }

    // Forzar JPEG para optimizar tamaño (PNG/WEBP → JPEG)
    if (ext !== "jpeg" && ext !== "jpg") {
      compressedUrl = compressedUrl.replace(/^data:image\/[a-z]+/, "data:image/jpeg");
    }

    return NextResponse.json({ url: compressedUrl });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ error: "Error al procesar imagen" }, { status: 500 });
  }
}
