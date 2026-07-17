import { NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/supabaseStorage";

export async function POST(request: Request) {
  try {
    const { dataUrl, fileName } = await request.json();

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Se requiere una imagen válida en base64" }, { status: 400 });
    }

    // Usar fileName si se proporcionó, o generar uno único
    const finalFileName = fileName || `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const publicUrl = await uploadToStorage(finalFileName, dataUrl);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ error: "Error al procesar imagen" }, { status: 500 });
  }
}
