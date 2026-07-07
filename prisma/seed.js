// Simple CommonJS seed file that works directly with Node
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.inventarioMovimiento.deleteMany();
  await prisma.receta.deleteMany();
  await prisma.extraOrden.deleteMany();
  await prisma.opcionOrden.deleteMany();
  await prisma.detalleOrden.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.orden.deleteMany();
  await prisma.ingrediente.deleteMany();
  await prisma.platillo.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.mesa.deleteMany();
  await prisma.user.deleteMany();
  await prisma.reservacion.deleteMany();

  // USERS
  const hash = bcrypt.hashSync("123456", 10);
  await prisma.user.createMany({
    data: [
      { nombre: "Bibiana", usuario: "bibiana", passwordHash: hash, role: "MESERO" },
      { nombre: "Jesús", usuario: "jesus", passwordHash: hash, role: "MESERO" },
      { nombre: "Chef María", usuario: "chef", passwordHash: hash, role: "CHEF" },
      { nombre: "Admin", usuario: "admin", passwordHash: hash, role: "ADMIN" },
    ],
  });
  console.log("✅ Usuarios");

  // TABLES
  const areas = ["Ventanas", "Pasillo", "Terraza"];
  let n = 1;
  for (const area of areas) {
    for (let i = 0; i < 4; i++) {
      await prisma.mesa.create({ data: { numero: n, capacidad: 4, area, estado: "LIBRE" } });
      n++;
    }
  }
  console.log("✅ 12 mesas");

  // CATEGORIES
  const cats = [
    ["Pesayunos", "🥞", 1], ["Platillos Mexicanos", "🇲🇽", 2], ["Pastas", "🍝", 3],
    ["Pizzas", "🍕", 4], ["Sopas", "🥣", 5], ["Parrilla", "🥩", 6],
    ["Guarniciones", "🥦", 7], ["Sándwiches", "🥪", 8], ["Ensaladas", "🥗", 9],
    ["Bebidas", "🥤", 10], ["Bebidas con Alcohol", "🍹", 11],
  ];
  for (const [name, icon, orden] of cats) {
    await prisma.categoria.create({ data: { nombre: name, icono: icon, orden } });
  }

  // CATEGORY ID MAP
  const catMap = {};
  const catRows = await prisma.categoria.findMany();
  for (const c of catRows) catMap[c.nombre] = c.id;

  // DISHES
  const dishes = [
    [1, "Waffles Canela Manzana", "Monaca confitada, canela, helado, miel maple", 100],
    [1, "Waffles Fruta Fresca", "Fruta fresca, mermelada frutos rojos o cajeta y plátano", 100],
    [1, "Waffles de Tocino y Maple", "Waffles con tocino y miel maple", 120],
    [1, "Tapas con Huevos Estrellados", "Pan, queso, aguacate, huevo estrellado", 85],
    [1, "Tapas de Arrachera con Aguacate", "Arrachera, aguacate, cebolla, chile, pico de gallo", 115],
    [2, "Enchiladas", "Bañadas en salsa verde o roja", 120],
    [2, "Volcanes Tapatíos con Jamón", "Pan con frijoles, queso, jamón, pico de gallo", 80],
    [3, "Pasta 3 Quesos", "Mix de 3 quesos", 100],
    [3, "Pasta al Camarón al Ajo", "Camarón, ajo, crema, chile", 180],
    [3, "Pasta al Burro", "Mantequilla, perejil, parmesano", 120],
    [3, "Fettuccine del Mar", "Camarón, surimi, pulpo, crema ácida", 250],
    [4, "Pizza Hawaiana (8 pzas)", "Piña y jamón", 250],
    [4, "Pizza Margarita (8 pzas)", "Tomate, albahaca, mozzarella", 250],
    [4, "Pizza Pepperoni (8 pzas)", "Pepperoni", 250],
    [4, "Pizza Portobello (8 pzas)", "Salsa Alfredo, champis, mariscos", 300],
    [4, "Pizza Mexicana (8 pzas)", "Pimiento, frijol, jalapeño, arrachera", 280],
    [4, "Pizza de Chorizo (8 pzas)", "Chorizo argentino, espinaca", 300],
    [4, "Pizza 3 Quesos (8 pzas)", "Mozzarella, provolone, parmesano", 300],
    [5, "Sopa de Tortilla", "Sopa tradicional", 100],
    [5, "Sopa de Frijol Peruano", "Con chipotle y chicharrón", 123],
    [5, "Crema de Camarón", "Crema suave de camarón", 150],
    [6, "T-Bone (410g)", "Corte T-Bone 410g", 450],
    [6, "Rib Eye (370g)", "Rib Eye 370g", 450],
    [6, "Sirloin (330g)", "Sirloin 330g", 450],
    [7, "Verduras al Vapor/Parrilla", "Verduras mixtas", 90],
    [7, "Verduras Salteadas Mantequilla", "250g salteadas", 80],
    [7, "Guacamole con Totopos", "Guacamole fresco con totopos", 80],
    [7, "Champiñones al Ajillo", "Champiñones salteados", 100],
    [7, "Espárragos con Romero", "5-7 pzas con aceite de romero", 130],
    [8, "Sándwich de Jamón", "Jamón de pavo con papas", 80],
    [8, "Sándwich de Pollo", "Pollo con papas", 90],
    [8, "Club Sándwich", "Club sándwich con papas", 120],
    [9, "Ensalada Verde", "Lechuga, espinaca, pechuga, manzana", 130],
    [9, "Ensalada de Jamón de Pavo", "Mix vegetales, jamón, queso panela", 130],
    [9, "Ensalada Queso Panela Asado", "Queso panela, espinacas, nuez", 130],
    [9, "Ensalada Fresca de Atún", "Pepino, atún, aguacate", 150],
    [9, "Ensalada Frutos Rojos", "Fresas, frambuesa, blueberry, maple", 150],
    [10, "Naranjada Natural", "", 45], [10, "Naranjada Mineral", "", 60],
    [10, "Limonada Natural", "", 45], [10, "Limonada Mineral", "", 60],
    [10, "Agua Frutos Rojos (Vaso)", "", 35], [10, "Agua Frutos Rojos (Jarra)", "", 95],
    [10, "Limonada de Fresa Natural", "", 45], [10, "Limonada de Fresa Mineral", "", 60],
    [10, "Agua de Avena con Manzana", "", 90], [10, "Agua de Coco (Jarra)", "", 130],
    [10, "Pepino con Chía (Vaso)", "", 35], [10, "Pepino con Chía (Jarra)", "", 90],
    [10, "Agua Maracuyá (Vaso)", "", 35], [10, "Agua Maracuyá (Jarra)", "", 90],
    [10, "Piñada", "", 90],
    [11, "Mojito Frutos Rojos", "", 100], [11, "Mojito Clásico", "", 100],
    [11, "Mojito Maracuyá", "", 100], [11, "Piña Colada", "", 95],
    [11, "Margarita Clásica", "Don Julio 70, Cointreau", 95],
    [11, "Margarita Maracuyá", "Mezcal, maracuyá", 110],
    [11, "Cantaritos", "", 95], [11, "Michelada", "", 80],
    [11, "Michelada Grande", "", 160], [11, "Camaronera", "", 90],
    [11, "Camaronera Grande", "", 140], [11, "Chelada", "", 70],
    [11, "Chelada Grande", "", 130], [11, "Carajillo", "", 110],
    [11, "Smoothie (varios)", "Frutos rojos, maracuyá, mango, fresa", 100],
    [11, "Carajillo de Mozzapan", "Bailey's, ron, café", 130],
  ];

  for (const [catId, name, desc, price] of dishes) {
    await prisma.platillo.create({
      data: { categoriaId: catId, nombre: name, descripcion: desc, precio: price },
    });
  }
  console.log(`✅ ${dishes.length} platillos`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
