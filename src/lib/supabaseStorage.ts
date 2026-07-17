import { createClient } from "@supabase/supabase-js";

// Cliente de servidor (con service_role para subir/borrar)
function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

const BUCKET = "gaucho-imagenes";

/**
 * Sube una imagen base64 a Supabase Storage y devuelve la URL pública.
 * @param fileKey  - Nombre único del archivo (ej: "platillo/123.jpg")
 * @param dataUrl  - DataURL base64 de la imagen
 * @returns        - URL pública de la imagen
 */
export async function uploadToStorage(
  fileKey: string,
  dataUrl: string
): Promise<string> {
  const supabase = createSupabaseAdmin();

  // Extraer el buffer del base64
  const matches = dataUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  if (!matches) throw new Error("Formato de dataUrl inválido");

  const ext = matches[1].toLowerCase();
  const buffer = Buffer.from(matches[2], "base64");
  
  // Asegurar extensión correcta
  let finalKey = fileKey;
  if (!finalKey.endsWith(`.${ext}`)) {
    finalKey = `${finalKey}.${ext}`;
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(finalKey, buffer, {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: true,
    });

  if (error) {
    // Si el bucket no existe, crearlo
    const isBucketError = error.message?.includes("bucket") || (error.statusCode !== undefined && error.statusCode === "404");
    if (isBucketError) {
      await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
      // Reintentar subida
      const { error: retryError } = await supabase.storage
        .from(BUCKET)
        .upload(finalKey, buffer, {
          contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
          upsert: true,
        });
      if (retryError) throw retryError;
    } else {
      throw error;
    }
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(finalKey);
  return urlData.publicUrl;
}

/**
 * Obtiene la URL pública de un archivo en Storage.
 */
export function getStorageUrl(fileName: string): string {
  const url = process.env.SUPABASE_URL;
  return `${url}/storage/v1/object/public/${BUCKET}/${fileName}`;
}

/**
 * Elimina un archivo de Storage.
 */
export async function deleteFromStorage(fileName: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([fileName]);
  if (error) console.error("Error deleting from storage:", error);
}
