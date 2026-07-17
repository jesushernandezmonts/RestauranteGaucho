/**
 * Comprime una imagen usando Canvas del navegador.
 * Redimensiona a un ancho máximo y convierte a JPEG con calidad reducida.
 *
 * @param file - Archivo de imagen original
 * @param maxWidth - Ancho máximo en px (default: 800)
 * @param quality - Calidad JPEG 0-1 (default: 0.7)
 * @returns DataURL comprimido listo para enviar al servidor
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error leyendo archivo"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error cargando imagen"));
      img.onload = () => {
        // Calcular dimensiones manteniendo proporción
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Dibujar en canvas y comprimir
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas no soportado"));

        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG comprimido
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
