import { NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/supabaseStorage";

export async function POST(request: Request) {
  try {
    // Verificar variables de entorno primero
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing env vars:", {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
      return NextResponse.json(
        { error: "Variables de entorno de Supabase no configuradas en el servidor" },
        { status: 500 }
      );
    }

    // Handle body size limits
    let body: { dataUrl?: string; fileName?: string };
    try {
      body = await request.json();
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Body parsing error:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });
      
      let errorMessage = "No se pudo leer el cuerpo de la petición.";
      if (err.message?.includes('request entity too large') || 
          err.message?.includes('payload too large') ||
          err.message?.includes('too large')) {
        errorMessage = "La imagen es demasiado grande. Por favor, reduce el tamaño de la imagen.";
      } else if (err.message?.includes('invalid JSON') || 
                 err.message?.includes('Unexpected token')) {
        errorMessage = "El cuerpo de la petición no es JSON válido. Verifica el formato de los datos.";
      } else {
        errorMessage = `Error al procesar la petición: ${err.message || "Error desconocido"}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { dataUrl, fileName } = body;

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      const debugInfo = dataUrl ? {
        length: dataUrl.length,
        type: typeof dataUrl,
        startsWith: dataUrl.substring(0, 20),
      } : { value: dataUrl };
      
      console.error("Invalid image data received:", debugInfo);
      
      let errorMsg = "Se requiere una imagen válida en base64 (data:image/...).";
      if (dataUrl && !dataUrl.startsWith("data:image/")) {
        errorMsg += ` El dato recibido comienza con: "${dataUrl.substring(0, 30)}".`;
      } else if (!dataUrl) {
        errorMsg += " No se proporcionó dataUrl en la petición.";
      }
      
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    // Usar fileName si se proporcionó, o generar uno único
    const finalFileName = fileName || `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log("Starting upload:", {
      fileName: finalFileName,
      dataUrlLength: dataUrl.length,
      mimeType: dataUrl.split(';')[0].split(':')[1],
    });

    const publicUrl = await uploadToStorage(finalFileName, dataUrl);
    
    console.log("Upload successful:", {
      fileName: finalFileName,
      url: publicUrl,
    });
    
    return NextResponse.json({ url: publicUrl });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error processing image:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    
    let message = "Error desconocido al procesar imagen";
    if (err.message) {
      message = `Error al procesar imagen: ${err.message}`;
    } else if (typeof error === 'string') {
      message = `Error al procesar imagen: ${error}`;
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
