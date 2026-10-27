import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { fetchProductos, formatARS } from "@/utils/api";
import { addToCart } from "@/utils/cart";

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/store/product/$id" });
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["productos"], queryFn: fetchProductos });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const p = data?.find((x) => x.id === Number(id));

  if (isLoading) {
    return <main className="container-page py-20 text-center text-muted-foreground">Cargando…</main>;
  }
  if (!p) {
    return (
      <main className="container-page py-20 text-center">
        <p className="text-muted-foreground">Producto no encontrado.</p>
        <Link to="/store" className="btn-primary mt-4">Volver al catálogo</Link>
      </main>
    );
  }

  const sinStock = !p.disponible || p.stock === 0;

  const handleAdd = () => {
    addToCart({
      idProducto: p.id,
      nombre: p.nombre,
      imagen: p.imagen,
      precio: p.precio,
      cantidad: qty,
      stock: p.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <main className="container-page py-8">
      <button onClick={() => navigate({ to: "/store" })} className="btn-ghost mb-6">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card-surface overflow-hidden">
          <div className="aspect-square bg-secondary">
            <img src={p.imagen} alt={p.nombre} className="h-full w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold">{p.nombre}</h1>
          <p className="mt-3 text-base text-muted-foreground">{p.descripcion}</p>
          <p className="mt-6 text-4xl font-semibold text-primary">{formatARS(p.precio)}</p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className={`badge-base ${sinStock ? "bg-destructive/15 text-destructive" : "bg-success/15 text-[oklch(0.4_0.14_150)]"}`}>
              {sinStock ? "Sin stock" : "Disponible"}
            </span>
            <span className="badge-base bg-secondary text-secondary-foreground">Stock: {p.stock}</span>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border bg-card">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={sinStock}
                className="px-3 py-2 hover:bg-secondary disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-10 px-3 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(p.stock, qty + 1))}
                disabled={sinStock || qty >= p.stock}
                className="px-3 py-2 hover:bg-secondary disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={handleAdd} disabled={sinStock} className="btn-primary flex-1 sm:flex-none">
              {added ? <><Check className="h-4 w-4" /> Agregado</> : <><ShoppingBag className="h-4 w-4" /> Agregar al carrito</>}
            </button>
          </div>

          {added && (
            <p className="mt-3 text-sm text-[oklch(0.4_0.14_150)]">
              Producto agregado al carrito.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
