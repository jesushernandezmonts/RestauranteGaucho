import "dotenv/config";
import { PrismaClient } from "@prisma/client/.prisma/client/index.js";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean all tables using TRUNCATE CASCADE to avoid FK issues
  const tables = [
    "InventarioMovimiento", "Receta", "ExtraOrden", "OpcionOrden",
    "DetalleOrden", "Pago", "Orden", "Ingrediente", "Platillo",
    "Categoria", "Mesa", "User", "Reservacion", "PushSubscription",
    "Configuracion", "Promocion"
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }

  // USERS
  const hash = await bcrypt.hash("123456", 10);
  await prisma.user.createMany({
    data: [
      { nombre: "Bibiana", usuario: "bibiana", passwordHash: hash, role: "MESERO" },
      { nombre: "Jesús", usuario: "jesus", passwordHash: hash, role: "MESERO" },
      { nombre: "Chef María", usuario: "chef", passwordHash: hash, role: "CHEF" },
      { nombre: "Admin", usuario: "admin", passwordHash: hash, role: "ADMIN" },
    ],
  });
  console.log("✅ 4 usuarios");

  // TABLES
  // Interior (mesas 1-5), then Exterior (mesas 6-14)
  const mesaConfig: { numero: number; area: string }[] = [
    // Interior
    { numero: 1, area: "Interior" },
    { numero: 2, area: "Interior" },
    { numero: 3, area: "Interior" },
    { numero: 4, area: "Interior" },
    { numero: 5, area: "Interior" },
    // Exterior
    { numero: 6, area: "Exterior" },
    { numero: 7, area: "Exterior" },
    { numero: 8, area: "Exterior" },
    { numero: 9, area: "Exterior" },
    { numero: 10, area: "Exterior" },
    { numero: 11, area: "Exterior" },
    { numero: 12, area: "Exterior" },
    { numero: 13, area: "Exterior" },
    { numero: 14, area: "Exterior" },
  ];
  for (const { numero, area } of mesaConfig) {
    await prisma.mesa.create({ data: { numero, capacidad: 4, area, estado: "LIBRE" } });
  }
  console.log("✅ 14 mesas (5 Interior, 9 Exterior)");

  // CATEGORIES
  const cats = [
    "Pesayunos", "Platillos Mexicanos", "Pastas", "Pizzas",
    "Sopas", "Parrilla", "Guarniciones", "Sándwiches",
    "Ensaladas", "Bebidas", "Bebidas con Alcohol",
  ];
  const catMap: Record<string, number> = {};
  for (let i = 0; i < cats.length; i++) {
    const iconos = ["🥞","🇲🇽","🍝","🍕","🥣","🥩","🥦","🥪","🥗","🥤","🍹"];
    const c = await prisma.categoria.create({
      data: { nombre: cats[i], icono: iconos[i], orden: i + 1 },
    });
    catMap[cats[i]] = c.id;
  }
  console.log("✅ Categorías");

  // DISHES (using dynamic category names)
  const dishData: [string, string, string, number][] = [
    ["Pesayunos","Waffles Canela Manzana","Monaca confitada, canela, helado, miel maple",100],
    ["Pesayunos","Waffles Fruta Fresca","Fruta fresca, mermelada frutos rojos o cajeta y plátano",100],
    ["Pesayunos","Waffles de Tocino y Maple","Waffles con tocino y miel maple",120],
    ["Pesayunos","Tapas con Huevos Estrellados","Pan, queso, aguacate, huevo estrellado",85],
    ["Pesayunos","Tapas de Arrachera con Aguacate","Arrachera, aguacate, cebolla, chile, pico de gallo",115],
    ["Platillos Mexicanos","Enchiladas","Bañadas en salsa verde o roja",120],
    ["Platillos Mexicanos","Volcanes Tapatíos con Jamón","Pan con frijoles, queso, jamón, pico de gallo",80],
    ["Pastas","Pasta 3 Quesos","Mix de 3 quesos",100],
    ["Pastas","Pasta al Camarón al Ajo","Camarón, ajo, crema, chile",180],
    ["Pastas","Pasta al Burro","Mantequilla, perejil, parmesano",120],
    ["Pastas","Fettuccine del Mar","Camarón, surimi, pulpo, crema ácida",250],
    ["Pizzas","Pizza Hawaiana (8 pzas)","Piña y jamón",250],
    ["Pizzas","Pizza Margarita (8 pzas)","Tomate, albahaca, mozzarella",250],
    ["Pizzas","Pizza Pepperoni (8 pzas)","Pepperoni",250],
    ["Pizzas","Pizza Portobello (8 pzas)","Salsa Alfredo, champis, mariscos",300],
    ["Pizzas","Pizza Mexicana (8 pzas)","Pimiento, frijol, jalapeño, arrachera",280],
    ["Pizzas","Pizza de Chorizo (8 pzas)","Chorizo argentino, espinaca",300],
    ["Pizzas","Pizza 3 Quesos (8 pzas)","Mozzarella, provolone, parmesano",300],
    ["Sopas","Sopa de Tortilla","Sopa tradicional",100],
    ["Sopas","Sopa de Frijol Peruano","Con chipotle y chicharrón",123],
    ["Sopas","Crema de Camarón","Crema suave de camarón",150],
    ["Parrilla","T-Bone (410g)","Corte T-Bone 410g",450],
    ["Parrilla","Rib Eye (370g)","Rib Eye 370g",450],
    ["Parrilla","Sirloin (330g)","Sirloin 330g",450],
    ["Guarniciones","Verduras al Vapor/Parrilla","Verduras mixtas",90],
    ["Guarniciones","Verduras Salteadas Mantequilla","250g salteadas",80],
    ["Guarniciones","Guacamole con Totopos","Guacamole fresco con totopos",80],
    ["Guarniciones","Champiñones al Ajillo","Champiñones salteados",100],
    ["Guarniciones","Espárragos con Romero","5-7 pzas con aceite de romero",130],
    ["Sándwiches","Sándwich de Jamón","Jamón de pavo con papas",80],
    ["Sándwiches","Sándwich de Pollo","Pollo con papas",90],
    ["Sándwiches","Club Sándwich","Club sándwich con papas",120],
    ["Ensaladas","Ensalada Verde","Lechuga, espinaca, pechuga, manzana",130],
    ["Ensaladas","Ensalada de Jamón de Pavo","Mix vegetales, jamón, queso panela",130],
    ["Ensaladas","Ensalada Queso Panela Asado","Queso panela, espinacas, nuez",130],
    ["Ensaladas","Ensalada Fresca de Atún","Pepino, atún, aguacate",150],
    ["Ensaladas","Ensalada Frutos Rojos","Fresas, frambuesa, blueberry, maple",150],
    ["Bebidas","Naranjada Natural","",45],
    ["Bebidas","Naranjada Mineral","",60],
    ["Bebidas","Limonada Natural","",45],
    ["Bebidas","Limonada Mineral","",60],
    ["Bebidas","Agua Frutos Rojos (Vaso)","",35],
    ["Bebidas","Agua Frutos Rojos (Jarra)","",95],
    ["Bebidas","Limonada de Fresa Natural","",45],
    ["Bebidas","Limonada de Fresa Mineral","",60],
    ["Bebidas","Agua de Avena con Manzana","",90],
    ["Bebidas","Agua de Coco (Jarra)","",130],
    ["Bebidas","Pepino con Chía (Vaso)","",35],
    ["Bebidas","Pepino con Chía (Jarra)","",90],
    ["Bebidas","Agua Maracuyá (Vaso)","",35],
    ["Bebidas","Agua Maracuyá (Jarra)","",90],
    ["Bebidas","Piñada","",90],
    ["Bebidas con Alcohol","Mojito Frutos Rojos","",100],
    ["Bebidas con Alcohol","Mojito Clásico","",100],
    ["Bebidas con Alcohol","Mojito Maracuyá","",100],
    ["Bebidas con Alcohol","Piña Colada","",95],
    ["Bebidas con Alcohol","Margarita Clásica","Don Julio 70, Cointreau",95],
    ["Bebidas con Alcohol","Margarita Maracuyá","Mezcal, maracuyá",110],
    ["Bebidas con Alcohol","Cantaritos","",95],
    ["Bebidas con Alcohol","Michelada","",80],
    ["Bebidas con Alcohol","Michelada Grande","",160],
    ["Bebidas con Alcohol","Camaronera","",90],
    ["Bebidas con Alcohol","Camaronera Grande","",140],
    ["Bebidas con Alcohol","Chelada","",70],
    ["Bebidas con Alcohol","Chelada Grande","",130],
    ["Bebidas con Alcohol","Carajillo","",110],
    ["Bebidas con Alcohol","Smoothie (varios)","Frutos rojos, maracuyá, mango, fresa",100],
    ["Bebidas con Alcohol","Carajillo de Mozzapan","Bailey's, ron, café",130],
  ];

  for (const [catNombre, nombre, desc, precio] of dishData) {
    await prisma.platillo.create({
      data: {
        categoriaId: catMap[catNombre],
        nombre,
        descripcion: desc,
        precio,
      },
    });
  }
  console.log(`✅ ${dishData.length} platillos`);

  // DEFAULT CONFIGURATION (appearence)
  const defaults: [string, string][] = [
    ["hero_fondo", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80"],
    ["logo_url", "/gaucho-logo.png"],
    ["about_imagen", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"],
    ["galeria_1_img", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80"],
    ["galeria_1_label", "Parrilla"],
    ["galeria_2_img", "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80"],
    ["galeria_2_label", "Ambiente"],
    ["galeria_3_img", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80"],
    ["galeria_3_label", "Platillos"],
    ["galeria_4_img", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"],
    ["galeria_4_label", "Cortes"],
    ["galeria_5_img", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"],
    ["galeria_5_label", "Pastas"],
    ["galeria_6_img", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"],
    ["galeria_6_label", "Bar"],
    ["galeria_7_img", "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80"],
    ["galeria_7_label", "Vinos"],
    ["galeria_8_img", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80"],
    ["galeria_8_label", "Postres"],
  ];
  for (const [clave, valor] of defaults) {
    await prisma.configuracion.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor },
    });
  }
  console.log("✅ Configuración de apariencia");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
