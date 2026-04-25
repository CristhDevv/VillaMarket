import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  
  if (!category) return {};
  
  const title = `Negocios de ${category.name} en Villa Rica`;
  const description = `Encuentra los mejores negocios locales en la categoría de ${category.name} en VillaMarket, Villa Rica, Cauca.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/negocios" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Volver a directorio
        </Link>
        <h1 className="text-2xl font-black text-foreground mb-4">
          <span className="text-3xl mr-2">{category.emoji}</span>
          Categoría: {category.name}
        </h1>
        <p className="text-muted">Los negocios de esta categoría se mostrarán aquí próximamente...</p>
      </div>
    </main>
  );
}
