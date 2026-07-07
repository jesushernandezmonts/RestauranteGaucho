-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MESERO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Mesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "capacidad" INTEGER NOT NULL DEFAULT 4,
    "area" TEXT NOT NULL DEFAULT 'Salón',
    "estado" TEXT NOT NULL DEFAULT 'LIBRE'
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL DEFAULT '🍽️',
    "orden" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Platillo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoriaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "precio" REAL NOT NULL,
    "imagen" TEXT NOT NULL DEFAULT '',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Platillo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ingrediente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "unidad" TEXT NOT NULL DEFAULT 'pieza',
    "stock" REAL NOT NULL DEFAULT 0,
    "stockMinimo" REAL NOT NULL DEFAULT 10,
    "costoSugerido" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Receta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "platilloId" INTEGER NOT NULL,
    "ingredienteId" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    CONSTRAINT "Receta_platilloId_fkey" FOREIGN KEY ("platilloId") REFERENCES "Platillo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receta_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "Ingrediente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Orden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mesaId" INTEGER NOT NULL,
    "meseroId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "total" REAL NOT NULL DEFAULT 0,
    "propina" REAL NOT NULL DEFAULT 0,
    "tipoPropina" TEXT NOT NULL DEFAULT '',
    "metodoPago" TEXT NOT NULL DEFAULT '',
    "cerradaPor" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    CONSTRAINT "Orden_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_meseroId_fkey" FOREIGN KEY ("meseroId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetalleOrden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordenId" INTEGER NOT NULL,
    "platilloId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "DetalleOrden_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleOrden_platilloId_fkey" FOREIGN KEY ("platilloId") REFERENCES "Platillo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExtraOrden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "detalleOrdenId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    CONSTRAINT "ExtraOrden_detalleOrdenId_fkey" FOREIGN KEY ("detalleOrdenId") REFERENCES "DetalleOrden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OpcionOrden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "detalleOrdenId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    CONSTRAINT "OpcionOrden_detalleOrdenId_fkey" FOREIGN KEY ("detalleOrdenId") REFERENCES "DetalleOrden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordenId" INTEGER NOT NULL,
    "meseroId" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "propina" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pago_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pago_meseroId_fkey" FOREIGN KEY ("meseroId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventarioMovimiento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredienteId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "referencia" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventarioMovimiento_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "Ingrediente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "fecha" DATETIME NOT NULL,
    "hora" TEXT NOT NULL,
    "personas" INTEGER NOT NULL DEFAULT 2,
    "notas" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_usuario_key" ON "User"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_numero_key" ON "Mesa"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Ingrediente_nombre_key" ON "Ingrediente"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Receta_platilloId_ingredienteId_key" ON "Receta"("platilloId", "ingredienteId");
