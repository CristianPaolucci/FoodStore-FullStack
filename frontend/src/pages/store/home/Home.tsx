import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { fetchCategorias, fetchProductos, formatARS } from "@/utils/api";
import type { Producto } from "@/types";

type Sort = "az" | "za" | "asc" | "desc";

export default function StoreHomePage() {
  const cats = useQuery({ queryKey: ["categorias"], queryFn: fetchCategorias });
  const prods = useQuery({ queryKey: ["productos"], queryFn: fetchProductos });

  const [cat, setCat] = useState<number | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("az");

  const filtered = useMemo(() => {
    const list = (prods.data ?? []).filter((p) => p.disponible && !p.eliminado);
    let r = cat === "all" ? list : list.filter((p) => p.categoriaId === cat);
    if (q.trim()) r = r.filter((p) => p.nombre.toLowerCase().includes(q.toLowerCase()));
    const sorted = [...r];
    sorted.sort((a, b) => {
      if (sort === "az") return a.nombre.localeCompare(b.nombre);
      if (sort === "za") return b.nombre.localeCompare(a.nombre);
      if (sort === "asc") return a.precio - b.precio;
      return b.precio - a.precio;
    });
    return sorted;
  }, [prods.data, cat, q, sort]);

  return (
    <main className="container-page py-8">
      <section className="mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/20 to-transparent p-8 md:p-12">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Hoy en el menú</p>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              Comida que enamora,<br />pedidos sin vueltas.
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Ingredientes frescos, recetas de la casa y entrega rápida. Elegí, pedí y disfrutá.
            </p>
          </div>
          <div className="hidden justify-end md:flex">
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"
              alt="Plato destacado"
              className="aspect-square w-64 rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <div className="card-surface p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categorías</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setCat("all")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    cat === "all" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  Todas
                </button>
              </li>
              {cats.data?.filter((c) => !c.eliminado).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCat(c.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      cat === c.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    }`}
                  >
                    {c.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar productos…"
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input-field pl-10">
                <option value="az">Nombre A-Z</option>
                <option value="za">Nombre Z-A</option>
                <option value="asc">Precio ↑</option>
                <option value="desc">Precio ↓</option>
              </select>
            </div>
          </div>

          {prods.isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Cargando productos…</div>
          ) : filtered.length === 0 ? (
            <div className="card-surface py-16 text-center text-muted-foreground">No encontramos productos.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProductCard({ p }: { p: Producto }) {
  return (
    <Link
      to="/store/product/$id"
      params={{ id: String(p.id) }}
      className="card-surface group overflow-hidden transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={p.imagen}
          alt={p.nombre}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        <span className="badge-base absolute left-3 top-3 bg-success/90 text-white">Disponible</span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold leading-snug">{p.nombre}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.descripcion}</p>
        <p className="mt-3 text-lg font-semibold text-primary">{formatARS(p.precio)}</p>
      </div>
    </Link>
  );
}
