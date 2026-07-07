import { prisma } from "@/lib/prisma";
import { MenuSection } from "@/components/MenuSection";

export const dynamic = "force-dynamic";

interface CategoriaConPlatillos {
  id: number;
  nombre: string;
  icono: string;
  platillos: {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
  }[];
}

async function getMenu(): Promise<CategoriaConPlatillos[]> {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { orden: "asc" },
      include: {
        platillos: {
          where: { activo: true },
          orderBy: { id: "asc" },
        },
      },
    });
    return categorias;
  } catch {
    return [];
  }
}

export async function MenuWrapper() {
  const categorias = await getMenu();

  if (categorias.length === 0) {
    return (
      <section id="menu" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="section-title">Nuestro Menú</h2>
          <p className="text-text-secondary">
            El menú estará disponible próximamente.
          </p>
        </div>
      </section>
    );
  }

  return <MenuSection categorias={categorias} />;
}
