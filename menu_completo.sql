-- ============================================================
-- SCRIPT PARA INSERTAR TODO EL MENÚ EN SUABASE
-- Pega esto en el SQL Editor de Supabase y ejecútalo
-- ============================================================

-- Primero limpiamos todo
TRUNCATE TABLE "Promocion" CASCADE;
TRUNCATE TABLE "Configuracion" CASCADE;
TRUNCATE TABLE "PushSubscription" CASCADE;
TRUNCATE TABLE "Reservacion" CASCADE;
TRUNCATE TABLE "OpcionOrden" CASCADE;
TRUNCATE TABLE "ExtraOrden" CASCADE;
TRUNCATE TABLE "DetalleOrden" CASCADE;
TRUNCATE TABLE "Pago" CASCADE;
TRUNCATE TABLE "Orden" CASCADE;
TRUNCATE TABLE "Receta" CASCADE;
TRUNCATE TABLE "InventarioMovimiento" CASCADE;
TRUNCATE TABLE "Platillo" CASCADE;
TRUNCATE TABLE "Categoria" CASCADE;
TRUNCATE TABLE "Mesa" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- ============================================================
-- 1. CATEGORÍAS
-- ============================================================
INSERT INTO "Categoria" (id, nombre, icono, orden) VALUES
(1,  'Pesayunos',             '🥞', 1),
(2,  'Platillos Mexicanos',   '🇲🇽', 2),
(3,  'Pastas',                '🍝', 3),
(4,  'Pizzas',                '🍕', 4),
(5,  'Sopas',                 '🥣', 5),
(6,  'Parrilla',              '🥩', 6),
(7,  'Guarniciones',          '🥦', 7),
(8,  'Sándwiches',            '🥪', 8),
(9,  'Ensaladas',             '🥗', 9),
(10, 'Bebidas',               '🥤', 10),
(11, 'Bebidas con Alcohol',   '🍹', 11),
(12, 'Crepas',                '🥞', 12),
(13, 'Bebidas Calientes',     '☕', 13),
(14, 'Postres',               '🍰', 14),
(15, 'Bebidas Frías',         '🧊', 15),
(16, 'Bar',                   '🍺', 16),
(17, 'Antojitos',             '🌮', 17),
(18, 'Hamburguesa',           '🍔', 18),
(19, 'Jugos',                 '🧃', 19),
(20, 'Licuados',              '🥛', 20),
(21, 'Pan Francés',           '🍞', 21),
(22, 'Hot Cakes y Waffles',   '🥞', 22),
(23, 'Bowls',                 '🥣', 23),
(24, 'Plato de Fruta',        '🍎', 24),
(25, 'Wraps',                 '🌯', 25),
(26, 'Toasts',                '🍞', 26);

-- ============================================================
-- 2. PLATILLOS
-- ============================================================

-- 🥞 PESAYUNOS (categoriaId = 1)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(1, 'Waffles Canela Manzana',    'Monaca confitada, canela y vainilla acompañado de una bola de helado y miel maple', 100, true),
(1, 'Waffles de Fruta Fresca',   'Mermelada de frutos rojos o cajeta y plátano', 100, true),
(1, 'Waffles de Tocino y Maple', 'Waffles con tocino y miel maple', 120, true),
(1, 'Tapas con Huevos Estrellados', 'Dos tapas de pan con mantequilla, un toque de queso, láminas de aguacate, acompañadas de un huevo estrellado', 85, true),
(1, 'Tapas de Arrachera con Aguacate', 'Dos tapas de pan con láminas de aguacate, cebolla morada, rodaja de chile serrano, pico de gallo y aguacate', 115, true),
(1, 'Huevos Rancheros', 'Huevos bañados en salsa verde o roja montados sobre tortilla frita untada con frijoles, acompañado y queso', 90, true),
(1, 'Huevos a la Mexicana', '', 85, true),
(1, 'Huevos con Jamón', '', 85, true),
(1, 'Omelette de Espinacas y Champiñones', 'Acompañado de pera uva', 90, true),
(1, 'Omelette de Pollo y Espinacas', 'Relleno acompañado de frijoles y aguacate', 90, true);

-- 🇲🇽 PLATILLOS MEXICANOS (categoriaId = 2)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(2, 'Enchiladas', 'Bañadas en salsa verde o roja', 120, true),
(2, 'Volcanes Tapatíos con Jamón', 'Dos tapas de pan, frijoles, queso, jamón y pico de gallo', 80, true);

-- 🍝 PASTAS (categoriaId = 3)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(3, 'Pasta 3 Quesos', 'Mix de quesos', 100, true),
(3, 'Pasta al Camarón al Ajo', 'Camarón salteado con ajo, aceite de chiles, crema, perejil deshidratado y hojuela de chile', 180, true),
(3, 'Pasta al Burro', 'Pasta salteada a la mantequilla, toque de perejil y queso parmesano', 120, true),
(3, 'Fettuccine del Mar', 'Camarón, surimi, pulpo, salteado con ajo, aceite de chile, crema ácida y queso parmesano', 250, true),
(3, 'Alfredo', '', 120, true),
(3, 'Boloñesa', '', 120, true);

-- 🍕 PIZZAS (categoriaId = 4)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(4, 'Pizza Hawaiana (8 pzas)', 'Piña y jamón', 250, true),
(4, 'Pizza Margarita (8 pzas)', 'Tomate, albahaca genovesa y queso mozzarella', 250, true),
(4, 'Pizza Pepperoni (8 pzas)', 'Pepperoni', 250, true),
(4, 'Pizza Portobello (8 pzas)', 'Base de salsa alfredo, mix de quesos, aceite de ajo, pesto de cilantro, crumble de chiles y mariscos', 300, true),
(4, 'Pizza Mexicana (8 pzas)', 'Pimiento morrón, frijol, chile jalapeño, cebolla y arrachera', 280, true),
(4, 'Pizza de Chorizo (8 pzas)', 'Chorizo argentino acompañado de hojas de espinaca', 300, true),
(4, 'Pizza 3 Quesos (8 pzas)', 'Mozzarella, provolone, parmesano', 300, true),
(4, 'Pizza Mexicana (6 pzas)', 'Chorizo, jalapeños, cebolla morada y frijoles', 250, true),
(4, 'Pizza Hawaiana (6 pzas)', 'Salsa de tomate, queso, jamón y piña', 250, true),
(4, 'Pizza Pepperoni (6 pzas)', 'Salami, pepperoni, jamón, chorizo argentino y queso', 250, true);

-- 🥣 SOPAS (categoriaId = 5)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(5, 'Sopa de Tortilla', '', 100, true),
(5, 'Sopa de Frijol Peruano', 'Con chipotle y chicharrón', 123, true),
(5, 'Crema de Camarón', '', 150, true),
(5, 'Crema de Frijol', '', 100, true);

-- 🥩 PARRILLA (categoriaId = 6)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(6, 'T-Bone (410g)', 'Corte T-Bone 410g', 450, true),
(6, 'Rib Eye (370g)', 'Rib Eye 370g', 450, true),
(6, 'Sirloin (330g)', 'Sirloin 330g', 450, true);

-- 🥦 GUARNICIONES (categoriaId = 7)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(7, 'Verduras al Vapor', '', 90, true),
(7, 'Verduras a la Parrilla', '', 90, true),
(7, 'Verduras Salteadas a la Mantequilla (250g)', '', 80, true),
(7, 'Guacamole con Totopos', 'Guacamole fresco con totopos', 80, true),
(7, 'Champiñones al Ajillo', 'Champiñones salteados', 100, true),
(7, 'Espárragos con Romero (5-7 pzas)', 'Con aceite de romero', 130, true);

-- 🥪 SÁNDWICHES (categoriaId = 8)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(8, 'Sándwich de Jamón', 'Jamón de pavo acompañado de papas a la francesa', 80, true),
(8, 'Sándwich de Pollo', 'Pollo acompañado de papas a la francesa', 90, true),
(8, 'Club Sándwich', '3 rebanadas de pan blanco, untado con mayonesa, pechuga deshebrada, lechuga, jitomate, aguacate, tocino, cebolla, jamón y queso manchego. Acompañado con papas a la francesa', 120, true);

-- 🥗 ENSALADAS (categoriaId = 9)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(9, 'Ensalada Verde', 'Lechuga, espinaca, pechuga a la plancha, manzana verde, pasta cocida, jitomate cherry. Aderezo de la casa', 130, true),
(9, 'Ensalada de Jamón de Pavo', 'Mix vegetales, lechuga, espinacas, cherry, cebolla, crotones, jamón de pavo y cubos de queso panela. Aderezo de mostaza miel', 130, true),
(9, 'Ensalada de Queso Panela Asado', 'Queso panela asado con miel, chile quebrado, espinacas, arándano, nuez. Aderezo de mostaza miel', 130, true),
(9, 'Ensalada Fresca de Atún', 'Rodajas de pepino, atún, cebolla morada, aguacate, verdura de la casa con queso crema y aderezo de la casa', 150, true),
(9, 'Ensalada Frutos Rojos', 'Lechuga, espinaca, fresas, frambuesa, blue berry, queso cottage, nuez, miel maple', 150, true);

-- 🥤 BEBIDAS (categoriaId = 10)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(10, 'Naranjada Natural', '', 45, true),
(10, 'Naranjada Mineral', '', 60, true),
(10, 'Limonada Natural', '', 45, true),
(10, 'Limonada Mineral', '', 60, true),
(10, 'Agua de Frutos Rojos (Vaso)', '', 35, true),
(10, 'Agua de Frutos Rojos (Jarra)', '', 95, true),
(10, 'Limonada de Fresa Natural', '', 45, true),
(10, 'Limonada de Fresa Mineral', '', 60, true),
(10, 'Agua de Avena con Manzana', '', 90, true),
(10, 'Jarra de Agua de Coco', '', 130, true),
(10, 'Pepino con Chía (Vaso)', '', 35, true),
(10, 'Pepino con Chía (Jarra)', '', 90, true),
(10, 'Agua Maracuyá (Vaso)', '', 35, true),
(10, 'Agua Maracuyá (Jarra)', '', 90, true),
(10, 'Piñada', '', 90, true);

-- 🍹 BEBIDAS CON ALCOHOL (categoriaId = 11)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(11, 'Mojito Frutos Rojos', '', 100, true),
(11, 'Mojito Clásico', '', 100, true),
(11, 'Mojito Maracuyá', '', 100, true),
(11, 'Piña Colada', '', 95, true),
(11, 'Margarita Clásica', 'Don Julio 70, Cointreau y jugo de limón', 95, true),
(11, 'Margarita Maracuyá', 'Mezcal, jarabe de agave, jarabe de maracuyá, jugo de limón', 110, true),
(11, 'Mezcalina', 'Mezcal, jarabe de agave, jugo de limón', 110, true),
(11, 'Cantaritos', '', 95, true),
(11, 'Michelada', '', 80, true),
(11, 'Michelada Grande', '', 160, true),
(11, 'Camaronera', '', 90, true),
(11, 'Camaronera Grande', '', 140, true),
(11, 'Chelada', '', 70, true),
(11, 'Chelada Grande', '', 130, true),
(11, 'Carajillo', '', 110, true),
(11, 'Smoothie (varios sabores)', 'Frutos rojos, maracuyá, mango, fresa', 100, true),
(11, 'Carajillo de Mozzapan', 'Baileys, ron, café', 130, true);

-- 🥞 CREPAS (categoriaId = 12)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(12, 'Crepa de Cajeta', 'Con una bola de helado', 55, true),
(12, 'Crepa de Lechera', 'Con una bola de helado', 55, true),
(12, 'Crepa de Mermelada', 'Con una bola de helado', 55, true),
(12, 'Crepa de Nutella', 'Con una bola de helado', 65, true),
(12, 'Topping extra', 'Plátano, fresa, nuez o queso crema', 0, true);

-- ☕ BEBIDAS CALIENTES (categoriaId = 13)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(13, 'Café de Olla', '', 25, true),
(13, 'Cappuccino de Sabores', 'Baileys, vainilla, cajeta', 70, true),
(13, 'Cappuccino Tradicional', '', 50, true),
(13, 'Café Americano', '', 45, true),
(13, 'Espresso', '', 45, true),
(13, 'Té Gourmet', '', 45, true),
(13, 'Té de Manzanilla', '', 25, true),
(13, 'Frappé (Capuchino/Vainilla)', '', 60, true);

-- 🍰 POSTRES (categoriaId = 14)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(14, 'Panqué de Nuez', '', 35, true),
(14, 'Rebanada de Pastel', '', 45, true),
(14, 'Gelatina', '', 35, true);

-- 🧊 BEBIDAS FRÍAS (categoriaId = 15)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(15, 'Coca Cola (lata)', '', 45, true),
(15, 'Sprite (lata)', '', 45, true),
(15, 'Delaware (lata)', '', 45, true),
(15, 'Jugo del Valle (lata)', '', 45, true),
(15, 'Fanta (lata)', '', 45, true),
(15, 'Frappé (Capuchino/Vainilla)', '', 70, true),
(15, 'Jarra de Agua de Sabor', '', 80, true),
(15, 'Vaso de Agua de Sabor', '', 30, true),
(15, 'Botella de Agua', '', 25, true);

-- 🍺 BAR (categoriaId = 16)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(16, 'Cerveza de Latón', '', 55, true),
(16, 'Tarro Chelado', '', 25, true),
(16, 'Tarro Michelada', '', 30, true),
(16, 'Tarro Clamato', '', 30, true),
(16, 'Mojitos', '', 50, true),
(16, 'Carajillo', '', 80, true),
(16, 'Copa de Clericot', '', 50, true),
(16, 'Jarra de Clericot', '', 180, true),
(16, 'Mimosa', '', 50, true);

-- 🌮 ANTOJITOS (categoriaId = 17)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(17, 'Tacos de Arrachera', '', 150, true),
(17, 'Enmoladas de Pollo (orden de 3)', '', 100, true),
(17, 'Enchiladas Suizas (orden de 3)', '', 120, true);

-- 🍔 HAMBURGUESA (categoriaId = 18)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(18, 'Hamburguesa', 'Carne sirloin a la plancha, queso amarillo, jitomate, lechuga, tocino, pepinillos', 150, true),
(18, 'Orden de Papas a la Francesa', '', 80, true);

-- 🧃 JUGOS (categoriaId = 19)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(19, 'Jugo de Naranja', '', 35, true),
(19, 'Juego Verde', '', 35, true),
(19, 'Jugo de Frutos Rojos', '', 35, true),
(19, 'Jugo Fresco (Manzana, Apio y Limón)', '', 35, true);

-- 🥛 LICUADOS (categoriaId = 20)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(20, 'Licuado de Frutos Rojos', '', 45, true),
(20, 'Licuado de Fresa', '', 45, true),
(20, 'Licuado de Chocomilk', '', 45, true),
(20, 'Licuado de Plátano', '', 45, true);

-- 🍞 PAN FRANCÉS (categoriaId = 21)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(21, 'Pan Francés con Frutos Rojos', 'Con lechera', 80, true);

-- 🥞 HOT CAKES Y WAFFLES (categoriaId = 22)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(22, 'Hot Cakes Sencillos', 'Mermelada, nutella o miel', 70, true),
(22, 'Hot Cakes con Fruta y Crema Batida', '', 85, true);

-- 🥣 BOWLS (categoriaId = 23)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(23, 'Bowls de Frutos Rojos', 'Plátano, fresas, blue berries, granola y miel', 130, true);

-- 🍎 PLATO DE FRUTA (categoriaId = 24)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(24, 'Plato de Fruta', 'Plátano, manzana y pera con yogurt natural', 70, true);

-- 🌯 WRAPS (categoriaId = 25)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(25, 'Wrap de Pollo', 'Queso panela, pollo, lechuga, jitomate, espinaca y aderezo de cilantro', 140, true),
(25, 'Wrap de Pavo', 'Jamón de pavo, lechuga, espinaca, rebanadas de aguacate y jitomate. Aderezo de chipotle', 100, true);

-- 🍞 TOASTS (categoriaId = 26)
INSERT INTO "Platillo" (categoriaId, nombre, descripcion, precio, activo) VALUES
(26, 'Toast de Huevo', 'Pan masa madre, aguacate, huevo estrellado al horno, tomate cherry, queso panela', 100, true),
(26, 'Toast Spicy Arrachera', 'Pan masa madre, queso gouda, arrachera, cebolla morada y pico de gallo', 150, true);

-- ============================================================
-- 3. CONFIGURACIÓN POR DEFECTO
-- ============================================================
INSERT INTO "Configuracion" (clave, valor) VALUES
('hero_fondo', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80'),
('logo_url', '/gaucho-logo.png'),
('about_imagen', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80');

-- ============================================================
-- 4. USUARIOS (password: 123456)
-- ============================================================
INSERT INTO "User" (nombre, usuario, "passwordHash", role, activo) VALUES
('Bibiana',  'bibiana', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MESERO', true),
('Jesús',    'jesus',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MESERO', true),
('Chef María', 'chef',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CHEF', true),
('Admin',     'admin',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', true);

-- ============================================================
-- 5. MESAS
-- ============================================================
DO $$
DECLARE
  i int;
  n int := 1;
BEGIN
  FOR i IN 1..5 LOOP
    INSERT INTO "Mesa" (numero, capacidad, area, estado) VALUES (n, 4, 'Exterior', 'LIBRE');
    n := n + 1;
  END LOOP;
  FOR i IN 1..5 LOOP
    INSERT INTO "Mesa" (numero, capacidad, area, estado) VALUES (n, 4, 'Interior', 'LIBRE');
    n := n + 1;
  END LOOP;
END $$;

-- ============================================================
-- ¡LISTO!
-- ============================================================
