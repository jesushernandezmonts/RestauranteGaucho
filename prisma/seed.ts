import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean existing data ──────────────────────────────
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

  // ─── USUARIOS ─────────────────────────────────────────
  const hash = await bcrypt.hash("123456", 10);
  await prisma.user.createMany({
    data: [
      { nombre: "Bibiana", usuario: "bibiana", passwordHash: hash, role: "MESERO" },
      { nombre: "Jesús", usuario: "jesus", passwordHash: hash, role: "MESERO" },
      { nombre: "Chef María", usuario: "chef", passwordHash: hash, role: "CHEF" },
      { nombre: "Admin", usuario: "admin", passwordHash: hash, role: "ADMIN" },
    ],
  });
  console.log("✅ Usuarios creados: bibiana, jesus, chef, admin (pass: 123456)");

  // ─── MESAS ────────────────────────────────────────────
  const areas = ["Ventanas", "Pasillo", "Terraza"];
  let mesaNum = 1;
  for (const area of areas) {
    for (let i = 0; i < 4; i++) {
      await prisma.mesa.create({
        data: { numero: mesaNum, capacidad: 4, area, estado: "LIBRE" },
      });
      mesaNum++;
    }
  }
  console.log("✅ 12 mesas creadas");

  // ─── CATEGORÍAS ───────────────────────────────────────
  const cats = [
    { nombre: "Pesayunos", icono: "🥞", orden: 1 },
    { nombre: "Platillos Mexicanos", icono: "🇲🇽", orden: 2 },
    { nombre: "Pastas", icono: "🍝", orden: 3 },
    { nombre: "Pizzas", icono: "🍕", orden: 4 },
    { nombre: "Sopas", icono: "🥣", orden: 5 },
    { nombre: "Parrilla", icono: "🥩", orden: 6 },
    { nombre: "Guarniciones", icono: "🥦", orden: 7 },
    { nombre: "Sándwiches", icono: "🥪", orden: 8 },
    { nombre: "Ensaladas", icono: "🥗", orden: 9 },
    { nombre: "Bebidas", icono: "🥤", orden: 10 },
    { nombre: "Bebidas con Alcohol", icono: "🍹", orden: 11 },
  ];

  for (const c of cats) {
    await prisma.categoria.create({ data: c });
  }
  console.log("✅ Categorías creadas");

  // ─── INGREDIENTES ─────────────────────────────────────
  const ingredientes = [
    { nombre: "Pan para waffle", unidad: "pieza", stock: 50, stockMinimo: 10, costoSugerido: 8 },
    { nombre: "Canela molida", unidad: "gramo", stock: 1000, stockMinimo: 100, costoSugerido: 0.5 },
    { nombre: "Manzana", unidad: "pieza", stock: 30, stockMinimo: 5, costoSugerido: 10 },
    { nombre: "Helado de vainilla", unidad: "bola", stock: 100, stockMinimo: 20, costoSugerido: 5 },
    { nombre: "Miel maple", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 0.8 },
    { nombre: "Fruta fresca", unidad: "porcion", stock: 40, stockMinimo: 10, costoSugerido: 12 },
    { nombre: "Mermelada frutos rojos", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 1.5 },
    { nombre: "Cajeta", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 1.2 },
    { nombre: "Plátano", unidad: "pieza", stock: 30, stockMinimo: 5, costoSugerido: 5 },
    { nombre: "Tocino", unidad: "rebanada", stock: 100, stockMinimo: 20, costoSugerido: 4 },
    { nombre: "Tapa de pan", unidad: "pieza", stock: 100, stockMinimo: 20, costoSugerido: 3 },
    { nombre: "Huevo", unidad: "pieza", stock: 120, stockMinimo: 24, costoSugerido: 4 },
    { nombre: "Mantequilla", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.3 },
    { nombre: "Queso", unidad: "rebanada", stock: 100, stockMinimo: 20, costoSugerido: 5 },
    { nombre: "Aguacate", unidad: "pieza", stock: 30, stockMinimo: 5, costoSugerido: 15 },
    { nombre: "Arrachera", unidad: "gramo", stock: 10000, stockMinimo: 1000, costoSugerido: 0.3 },
    { nombre: "Cebolla morada", unidad: "pieza", stock: 20, stockMinimo: 5, costoSugerido: 8 },
    { nombre: "Chile serrano", unidad: "pieza", stock: 30, stockMinimo: 5, costoSugerido: 2 },
    { nombre: "Pico de gallo", unidad: "porcion", stock: 30, stockMinimo: 5, costoSugerido: 10 },
    { nombre: "Tortilla frita", unidad: "pieza", stock: 60, stockMinimo: 10, costoSugerido: 2 },
    { nombre: "Frijoles", unidad: "gramo", stock: 5000, stockMinimo: 500, costoSugerido: 0.1 },
    { nombre: "Salsa verde", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 0.5 },
    { nombre: "Salsa roja", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 0.5 },
    { nombre: "Jamón", unidad: "rebanada", stock: 80, stockMinimo: 15, costoSugerido: 4 },
    { nombre: "Espinacas", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.8 },
    { nombre: "Champiñones", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.6 },
    { nombre: "Pechuga de pollo", unidad: "gramo", stock: 5000, stockMinimo: 500, costoSugerido: 0.2 },
    { nombre: "Pera", unidad: "pieza", stock: 20, stockMinimo: 5, costoSugerido: 8 },
    { nombre: "Uva", unidad: "gramo", stock: 1000, stockMinimo: 100, costoSugerido: 0.5 },
    { nombre: "Tortilla de maíz", unidad: "pieza", stock: 60, stockMinimo: 10, costoSugerido: 2 },
    { nombre: "Pasta 3 quesos", unidad: "gramo", stock: 5000, stockMinimo: 500, costoSugerido: 0.3 },
    { nombre: "Camarón", unidad: "gramo", stock: 5000, stockMinimo: 500, costoSugerido: 0.5 },
    { nombre: "Ajo", unidad: "diente", stock: 50, stockMinimo: 10, costoSugerido: 2 },
    { nombre: "Aceite de oliva", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 0.8 },
    { nombre: "Crema", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 0.6 },
    { nombre: "Perejil deshidratado", unidad: "gramo", stock: 500, stockMinimo: 50, costoSugerido: 0.3 },
    { nombre: "Hojuela de chile", unidad: "gramo", stock: 500, stockMinimo: 50, costoSugerido: 0.4 },
    { nombre: "Queso parmesano", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.5 },
    { nombre: "Surimi", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.3 },
    { nombre: "Pulpo", unidad: "gramo", stock: 3000, stockMinimo: 300, costoSugerido: 0.8 },
    { nombre: "Crema ácida", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 0.5 },
    { nombre: "Masa de pizza", unidad: "pieza", stock: 30, stockMinimo: 5, costoSugerido: 15 },
    { nombre: "Salsa de tomate", unidad: "ml", stock: 3000, stockMinimo: 300, costoSugerido: 0.3 },
    { nombre: "Albahaca", unidad: "gramo", stock: 200, stockMinimo: 20, costoSugerido: 1 },
    { nombre: "Queso mozzarella", unidad: "gramo", stock: 3000, stockMinimo: 300, costoSugerido: 0.4 },
    { nombre: "Pepperoni", unidad: "rebanada", stock: 100, stockMinimo: 15, costoSugerido: 3 },
    { nombre: "Salsa Alfredo", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 0.5 },
    { nombre: "Pesto de cilantro", unidad: "ml", stock: 500, stockMinimo: 50, costoSugerido: 0.7 },
    { nombre: "Chile crumble", unidad: "gramo", stock: 300, stockMinimo: 30, costoSugerido: 0.6 },
    { nombre: "Mariscos mixtos", unidad: "gramo", stock: 3000, stockMinimo: 300, costoSugerido: 0.6 },
    { nombre: "Pimiento morrón", unidad: "pieza", stock: 20, stockMinimo: 5, costoSugerido: 8 },
    { nombre: "Frijol refrito", unidad: "gramo", stock: 3000, stockMinimo: 300, costoSugerido: 0.2 },
    { nombre: "Chile jalapeño", unidad: "pieza", stock: 20, stockMinimo: 5, costoSugerido: 2 },
    { nombre: "Chorizo argentino", unidad: "gramo", stock: 3000, stockMinimo: 300, costoSugerido: 0.4 },
    { nombre: "Queso provolone", unidad: "gramo", stock: 1500, stockMinimo: 150, costoSugerido: 0.5 },
    { nombre: "Queso parmesano (pizza)", unidad: "gramo", stock: 1000, stockMinimo: 100, costoSugerido: 0.6 },
    { nombre: "Tortilla (sopa)", unidad: "pieza", stock: 50, stockMinimo: 10, costoSugerido: 2 },
    { nombre: "Frijol peruano", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.3 },
    { nombre: "Chipotle", unidad: "gramo", stock: 500, stockMinimo: 50, costoSugerido: 0.5 },
    { nombre: "Chicharrón", unidad: "gramo", stock: 1000, stockMinimo: 100, costoSugerido: 0.4 },
    { nombre: "T-Bone", unidad: "pieza", stock: 15, stockMinimo: 3, costoSugerido: 180 },
    { nombre: "Rib Eye", unidad: "pieza", stock: 15, stockMinimo: 3, costoSugerido: 180 },
    { nombre: "Sirloin", unidad: "pieza", stock: 15, stockMinimo: 3, costoSugerido: 180 },
    { nombre: "Verduras mixtas", unidad: "gramo", stock: 3000, stockMinimo: 300, costoSugerido: 0.3 },
    { nombre: "Papas", unidad: "gramo", stock: 10000, stockMinimo: 1000, costoSugerido: 0.2 },
    { nombre: "Totopos", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.3 },
    { nombre: "Espárragos", unidad: "pieza", stock: 40, stockMinimo: 5, costoSugerido: 8 },
    { nombre: "Romero", unidad: "gramo", stock: 100, stockMinimo: 10, costoSugerido: 1 },
    { nombre: "Pan de sándwich", unidad: "pieza", stock: 60, stockMinimo: 10, costoSugerido: 4 },
    { nombre: "Pavo (fiambre)", unidad: "rebanada", stock: 60, stockMinimo: 10, costoSugerido: 4 },
    { nombre: "Lechuga", unidad: "pieza", stock: 20, stockMinimo: 5, costoSugerido: 10 },
    { nombre: "Tomate", unidad: "pieza", stock: 30, stockMinimo: 5, costoSugerido: 6 },
    { nombre: "Queso panela", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.4 },
    { nombre: "Atún", unidad: "lata", stock: 30, stockMinimo: 5, costoSugerido: 15 },
    { nombre: "Pepino", unidad: "pieza", stock: 20, stockMinimo: 5, costoSugerido: 5 },
    { nombre: "Fresas", unidad: "gramo", stock: 1000, stockMinimo: 100, costoSugerido: 0.5 },
    { nombre: "Arándanos", unidad: "gramo", stock: 500, stockMinimo: 50, costoSugerido: 0.8 },
    { nombre: "Blueberry", unidad: "gramo", stock: 500, stockMinimo: 50, costoSugerido: 0.9 },
    { nombre: "Queso cottage", unidad: "gramo", stock: 500, stockMinimo: 50, costoSugerido: 0.5 },
    { nombre: "Nuez", unidad: "gramo", stock: 500, stockMinimo: 50, costoSugerido: 0.8 },
    { nombre: "Naranja", unidad: "pieza", stock: 30, stockMinimo: 5, costoSugerido: 6 },
    { nombre: "Limón", unidad: "pieza", stock: 40, stockMinimo: 5, costoSugerido: 3 },
    { nombre: "Agua mineral", unidad: "ml", stock: 10000, stockMinimo: 1000, costoSugerido: 0.05 },
    { nombre: "Frutos rojos (bebida)", unidad: "ml", stock: 3000, stockMinimo: 300, costoSugerido: 0.4 },
    { nombre: "Avena", unidad: "gramo", stock: 2000, stockMinimo: 200, costoSugerido: 0.2 },
    { nombre: "Coco (agua)", unidad: "ml", stock: 5000, stockMinimo: 500, costoSugerido: 0.3 },
    { nombre: "Chía", unidad: "gramo", stock: 500, stockMinimo: 50, costoSugerido: 0.6 },
    { nombre: "Maracuyá", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 0.5 },
    { nombre: "Piña", unidad: "pieza", stock: 15, stockMinimo: 3, costoSugerido: 15 },
    { nombre: "Mezcal", unidad: "ml", stock: 3000, stockMinimo: 300, costoSugerido: 1.5 },
    { nombre: "Tequila Don Julio 70", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 2 },
    { nombre: "Cointreau", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 1.8 },
    { nombre: "Menta", unidad: "gramo", stock: 200, stockMinimo: 20, costoSugerido: 1 },
    { nombre: "Ron", unidad: "ml", stock: 3000, stockMinimo: 300, costoSugerido: 0.8 },
    { nombre: "Vodka", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 0.8 },
    { nombre: "Cerveza", unidad: "pieza", stock: 60, stockMinimo: 12, costoSugerido: 12 },
    { nombre: "Clamato", unidad: "ml", stock: 2000, stockMinimo: 200, costoSugerido: 0.4 },
    { nombre: "Salsa inglesa", unidad: "ml", stock: 500, stockMinimo: 50, costoSugerido: 0.5 },
    { nombre: "Café", unidad: "ml", stock: 3000, stockMinimo: 300, costoSugerido: 0.3 },
    { nombre: "Bailey's", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 1.5 },
    { nombre: "Leche", unidad: "ml", stock: 5000, stockMinimo: 500, costoSugerido: 0.2 },
    { nombre: "Hielo", unidad: "gramo", stock: 20000, stockMinimo: 2000, costoSugerido: 0.05 },
    { nombre: "Pasta larga", unidad: "gramo", stock: 5000, stockMinimo: 500, costoSugerido: 0.2 },
    { nombre: "Crotones", unidad: "gramo", stock: 1000, stockMinimo: 100, costoSugerido: 0.3 },
    { nombre: "Aderezo mostaza miel", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 0.5 },
    { nombre: "Vinagre", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 0.3 },
    { nombre: "Mostaza", unidad: "ml", stock: 500, stockMinimo: 50, costoSugerido: 0.4 },
    { nombre: "Pan baguette", unidad: "pieza", stock: 20, stockMinimo: 5, costoSugerido: 15 },
    { nombre: "Chimichurri", unidad: "ml", stock: 1000, stockMinimo: 100, costoSugerido: 0.5 },
    { nombre: "Salsa Macha", unidad: "ml", stock: 500, stockMinimo: 50, costoSugerido: 0.8 },
    { nombre: "Pasta fettuccine", unidad: "gramo", stock: 3000, stockMinimo: 300, costoSugerido: 0.3 },
    { nombre: "Jengibre", unidad: "gramo", stock: 200, stockMinimo: 20, costoSugerido: 0.5 },
    { nombre: "Jarabe de agave", unidad: "ml", stock: 500, stockMinimo: 50, costoSugerido: 0.6 },
  ];

  for (const ing of ingredientes) {
    await prisma.ingrediente.create({ data: ing });
  }
  console.log("✅ Ingredientes creados");

  // ─── PLATILLOS ────────────────────────────────────────
  // Helper para obtener IDs de categorías e ingredientes
  const catsDb = await prisma.categoria.findMany({ orderBy: { id: "asc" } });
  const ingDb = await prisma.ingrediente.findMany({ orderBy: { id: "asc" } });
  const getCat = (nombre: string) => catsDb.find((c) => c.nombre === nombre)!.id;
  const getIng = (nombre: string) => ingDb.find((i) => i.nombre === nombre)!.id;

  // PESAYUNOS
  const platillosData = [
    // 🥞 PESAYUNOS (cat 1)
    { cat: "Pesayunos", nombre: "Waffles Canela Manzana", desc: "Monaca confitada, canela y vainilla acompañado de una bola de helado y miel maple", precio: 100 },
    { cat: "Pesayunos", nombre: "Waffles Fruta Fresca", desc: "Fruta fresca, mermelada de frutos rojos o cajeta y plátano", precio: 100 },
    { cat: "Pesayunos", nombre: "Waffles de Tocino y Maple", desc: "Waffles con tocino crujiente y miel maple", precio: 120 },
    { cat: "Pesayunos", nombre: "Tapas con Huevos Estrellados", desc: "Dos tapas de pan con mantequilla, queso, aguacate y huevo estrellado", precio: 85 },
    { cat: "Pesayunos", nombre: "Tapas de Arrachera con Aguacate", desc: "Dos tapas de pan con arrachera, aguacate, cebolla morada, chile serrano y pico de gallo", precio: 115 },
  ];

  // 🇲🇽 PLATILLOS MEXICANOS (cat 2)
  platillosData.push(
    { cat: "Platillos Mexicanos", nombre: "Enchiladas", desc: "Enchiladas bañadas en salsa verde o roja", precio: 120 },
    { cat: "Platillos Mexicanos", nombre: "Volcanes Tapatíos con Jamón", desc: "Dos tapas de pan con frijoles, queso, jamón y pico de gallo", precio: 80 }
  );

  // 🍝 PASTAS (cat 3)
  platillosData.push(
    { cat: "Pastas", nombre: "Pasta 3 Quesos", desc: "Mix de 3 quesos", precio: 100 },
    { cat: "Pastas", nombre: "Pasta al Camarón al Ajo", desc: "Camarón salteado con ajo, aceite de chiles, crema, perejil y hojuela de chile", precio: 180 },
    { cat: "Pastas", nombre: "Pasta al Burro", desc: "Pasta salteada a la mantequilla, toque de perejil y queso parmesano", precio: 120 },
    { cat: "Pastas", nombre: "Fettuccine del Mar", desc: "Camarón, surimi, pulpo salteados con ajo, aceite de chile, crema ácida y queso parmesano", precio: 250 }
  );

  // 🍕 PIZZAS (cat 4)
  platillosData.push(
    { cat: "Pizzas", nombre: "Pizza Hawaiana", desc: "8 piezas con piña y jamón", precio: 250 },
    { cat: "Pizzas", nombre: "Pizza Margarita", desc: "8 piezas con tomate, albahaca y queso mozzarella", precio: 250 },
    { cat: "Pizzas", nombre: "Pizza Pepperoni", desc: "8 piezas con pepperoni", precio: 250 },
    { cat: "Pizzas", nombre: "Pizza Portobello", desc: "Base de salsa Alfredo, mix de quesos, aceite de ajo, pesto de cilantro, crumble de chiles y mariscos", precio: 300 },
    { cat: "Pizzas", nombre: "Pizza Mexicana", desc: "Pimiento morrón, frijol, chile jalapeño, cebolla y arrachera", precio: 280 },
    { cat: "Pizzas", nombre: "Pizza de Chorizo", desc: "Chorizo argentino acompañado de hojas de espinaca", precio: 300 },
    { cat: "Pizzas", nombre: "Pizza 3 Quesos", desc: "Mozzarella, provolone y parmesano", precio: 300 }
  );

  // 🥣 SOPAS (cat 5)
  platillosData.push(
    { cat: "Sopas", nombre: "Sopa de Tortilla", desc: "Sopa tradicional de tortilla", precio: 100 },
    { cat: "Sopas", nombre: "Sopa de Frijol Peruano", desc: "Con chipotle y chicharrón", precio: 123 },
    { cat: "Sopas", nombre: "Crema de Camarón", desc: "Crema suave de camarón", precio: 150 }
  );

  // 🥩 PARRILLA (cat 6)
  platillosData.push(
    { cat: "Parrilla", nombre: "T-Bone (410g)", desc: "Corte T-Bone 410 gramos", precio: 450 },
    { cat: "Parrilla", nombre: "Rib Eye (370g)", desc: "Rib Eye 370 gramos", precio: 450 },
    { cat: "Parrilla", nombre: "Sirloin (330g)", desc: "Sirloin 330 gramos", precio: 450 }
  );

  // 🥦 GUARNICIONES (cat 7)
  platillosData.push(
    { cat: "Guarniciones", nombre: "Verduras al Vapor/Parrilla", desc: "Verduras mixtas", precio: 90 },
    { cat: "Guarniciones", nombre: "Verduras Salteadas Mantequilla", desc: "250 gramos salteadas con mantequilla", precio: 80 },
    { cat: "Guarniciones", nombre: "Guacamole con Totopos", desc: "Guacamole fresco con totopos", precio: 80 },
    { cat: "Guarniciones", nombre: "Champiñones al Ajillo", desc: "Champiñones salteados al ajillo", precio: 100 },
    { cat: "Guarniciones", nombre: "Espárragos con Romero", desc: "Espárragos (5-7 pzas) con aceite de romero", precio: 130 }
  );

  // 🥪 SÁNDWICHES (cat 8)
  platillosData.push(
    { cat: "Sándwiches", nombre: "Sándwich de Jamón", desc: "Jamón de pavo acompañado de papas a la francesa", precio: 80 },
    { cat: "Sándwiches", nombre: "Sándwich de Pollo", desc: "Pollo acompañado de papas a la francesa", precio: 90 },
    { cat: "Sándwiches", nombre: "Club Sándwich", desc: "Club sándwich acompañado con papas a la francesa", precio: 120 }
  );

  // 🥗 ENSALADAS (cat 9)
  platillosData.push(
    { cat: "Ensaladas", nombre: "Ensalada Verde", desc: "Lechuga, espinaca, pechuga a la plancha, manzana verde, pasas, jitomate cherry y aderezo de la casa", precio: 130 },
    { cat: "Ensaladas", nombre: "Ensalada de Jamón de Pavo", desc: "Mix vegetales, lechuga, espinacas, cherry, cebolla, crotones, jamón de pavo y cubos de queso panela. Aderezo de mostaza miel", precio: 130 },
    { cat: "Ensaladas", nombre: "Ensalada de Queso Panela Asado", desc: "Queso panela asado con miel, chile quebrado, espinacas, arándanos, nuez y aderezo de la casa", precio: 130 },
    { cat: "Ensaladas", nombre: "Ensalada Fresca de Atún", desc: "Rodajas de pepino, atún, cebolla morada, aguacate y aderezo de la casa con queso crema", precio: 150 },
    { cat: "Ensaladas", nombre: "Ensalada Frutos Rojos", desc: "Lechuga, espinaca, fresas, frambuesa, blueberry, queso cottage, nuez, miel maple", precio: 150 }
  );

  // 🥤 BEBIDAS (cat 10)
  platillosData.push(
    { cat: "Bebidas", nombre: "Naranjada Natural", desc: "Naranjada natural", precio: 45 },
    { cat: "Bebidas", nombre: "Naranjada Mineral", desc: "Naranjada con agua mineral", precio: 60 },
    { cat: "Bebidas", nombre: "Limonada Natural", desc: "Limonada natural", precio: 45 },
    { cat: "Bebidas", nombre: "Limonada Mineral", desc: "Limonada con agua mineral", precio: 60 },
    { cat: "Bebidas", nombre: "Agua de Frutos Rojos (Vaso)", desc: "Vaso de agua de frutos rojos", precio: 35 },
    { cat: "Bebidas", nombre: "Agua de Frutos Rojos (Jarra)", desc: "Jarra de agua de frutos rojos", precio: 95 },
    { cat: "Bebidas", nombre: "Limonada de Fresa Natural", desc: "Limonada de fresa natural", precio: 45 },
    { cat: "Bebidas", nombre: "Limonada de Fresa Mineral", desc: "Limonada de fresa mineral", precio: 60 },
    { cat: "Bebidas", nombre: "Agua de Avena con Manzana", desc: "Agua de avena con manzana", precio: 90 },
    { cat: "Bebidas", nombre: "Agua de Coco (Jarra)", desc: "Jarra de agua de coco", precio: 130 },
    { cat: "Bebidas", nombre: "Pepino con Chía (Vaso)", desc: "Vaso de agua de pepino con chía", precio: 35 },
    { cat: "Bebidas", nombre: "Pepino con Chía (Jarra)", desc: "Jarra de agua de pepino con chía", precio: 90 },
    { cat: "Bebidas", nombre: "Agua Maracuyá (Vaso)", desc: "Vaso de agua de maracuyá", precio: 35 },
    { cat: "Bebidas", nombre: "Agua Maracuyá (Jarra)", desc: "Jarra de agua de maracuyá", precio: 90 },
    { cat: "Bebidas", nombre: "Piñada", desc: "Agua de piña", precio: 90 }
  );

  // 🍹 BEBIDAS CON ALCOHOL (cat 11)
  platillosData.push(
    { cat: "Bebidas con Alcohol", nombre: "Mojito Frutos Rojos", desc: "Mojito con frutos rojos", precio: 100 },
    { cat: "Bebidas con Alcohol", nombre: "Mojito Clásico", desc: "Mojito clásico de menta", precio: 100 },
    { cat: "Bebidas con Alcohol", nombre: "Mojito Maracuyá", desc: "Mojito de maracuyá", precio: 100 },
    { cat: "Bebidas con Alcohol", nombre: "Piña Colada", desc: "Piña colada", precio: 95 },
    { cat: "Bebidas con Alcohol", nombre: "Margarita Clásica", desc: "Tequila Don Julio 70, limón, Cointreau y jugo de limón", precio: 95 },
    { cat: "Bebidas con Alcohol", nombre: "Margarita Maracuyá", desc: "Mezcal, jarabe de agave, maracuyá y jugo de limón", precio: 110 },
    { cat: "Bebidas con Alcohol", nombre: "Cantaritos", desc: "Cantarito tradicional", precio: 95 },
    { cat: "Bebidas con Alcohol", nombre: "Michelada", desc: "Michelada preparada", precio: 80 },
    { cat: "Bebidas con Alcohol", nombre: "Michelada Grande", desc: "Michelada preparada grande", precio: 160 },
    { cat: "Bebidas con Alcohol", nombre: "Camaronera", desc: "Camaronera preparada", precio: 90 },
    { cat: "Bebidas con Alcohol", nombre: "Camaronera Grande", desc: "Camaronera preparada grande", precio: 140 },
    { cat: "Bebidas con Alcohol", nombre: "Chelada", desc: "Chelada simple", precio: 70 },
    { cat: "Bebidas con Alcohol", nombre: "Chelada Grande", desc: "Chelada simple grande", precio: 130 },
    { cat: "Bebidas con Alcohol", nombre: "Carajillo", desc: "Carajillo clásico", precio: 110 },
    { cat: "Bebidas con Alcohol", nombre: "Smoothie (varios sabores)", desc: "Frutos rojos, maracuyá, tamarindo, mango, fresa", precio: 100 },
    { cat: "Bebidas con Alcohol", nombre: "Carajillo de Mozzapan", desc: "Bailey's, ron, café", precio: 130 }
  );

  for (const p of platillosData) {
    await prisma.platillo.create({
      data: {
        categoriaId: getCat(p.cat),
        nombre: p.nombre,
        descripcion: p.desc,
        precio: p.precio,
        imagen: "",
      },
    });
  }
  console.log(`✅ ${platillosData.length} platillos creados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
