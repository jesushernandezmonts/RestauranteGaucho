/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client/.prisma/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BUCKET = "gaucho-imagenes";
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function isBase64Image(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

async function uploadDataUrl(fileKey: string, dataUrl: string): Promise<string> {
  const matches = dataUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid dataUrl");

  const extRaw = matches[1].toLowerCase();
  const ext = extRaw === "jpeg" ? "jpg" : extRaw;
  const buffer = Buffer.from(matches[2], "base64");
  const finalKey = `${fileKey}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(finalKey, buffer, {
    contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(finalKey);
  return data.publicUrl;
}

async function main() {
  console.log("🚀 Starting image migration to Supabase Storage...");

  let migratedPlatillos = 0;
  let migratedConfig = 0;

  // 1) Migrar imágenes de platillos
  const platillos = await prisma.platillo.findMany({
    select: { id: true, nombre: true, imagen: true },
  });

  for (const p of platillos) {
    if (!isBase64Image(p.imagen)) continue;
    try {
      const url = await uploadDataUrl(`platillos/platillo-${p.id}`, p.imagen);
      await prisma.platillo.update({ where: { id: p.id }, data: { imagen: url } });
      migratedPlatillos++;
      console.log(`✅ Platillo ${p.id} (${p.nombre}) migrated`);
    } catch (error) {
      console.error(`❌ Failed platillo ${p.id} (${p.nombre})`, error);
    }
  }

  // 2) Migrar imágenes de configuración (hero, logo, about, galería)
  const imageConfigKeys = [
    "hero_fondo",
    "logo_url",
    "about_imagen",
    "galeria_1_img",
    "galeria_2_img",
    "galeria_3_img",
    "galeria_4_img",
    "galeria_5_img",
    "galeria_6_img",
    "galeria_7_img",
    "galeria_8_img",
  ];

  const configs = await prisma.configuracion.findMany({
    where: { clave: { in: imageConfigKeys } },
  });

  for (const c of configs) {
    if (!isBase64Image(c.valor)) continue;
    try {
      const safeKey = c.clave.replace(/[^a-zA-Z0-9_-]/g, "-");
      const url = await uploadDataUrl(`config/${safeKey}`, c.valor);
      await prisma.configuracion.update({ where: { clave: c.clave }, data: { valor: url } });
      migratedConfig++;
      console.log(`✅ Config ${c.clave} migrated`);
    } catch (error) {
      console.error(`❌ Failed config ${c.clave}`, error);
    }
  }

  console.log("\n🎉 Migration complete!");
  console.log(`Platillos migrated: ${migratedPlatillos}`);
  console.log(`Config images migrated: ${migratedConfig}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
