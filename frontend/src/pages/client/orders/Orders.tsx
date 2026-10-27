import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/foodstore/SiteShell";
import { EstadoBadge } from "@/components/foodstore/EstadoBadge";
import { fetchPedidos, fetchProductos, formatARS, formatFecha } from "@/utils/api";
import { getSession } from "@/utils/auth";
import { getLocalOrders } from "@/utils/cart";
import type { Pedido } from "@/types";

export default function ClientOrdersPage() {
  const user = getSession();
  const pedidos = useQuery({ queryKey: ["pedidos"], queryFn: fetchPedidos });
  const productos = useQuery({ queryKey: ["productos"], queryFn: fetchProductos });
  const [local, setLocal] = useState<Pedido[]>([]);
  const [selected, setSelected] = useState<Pedido | null>(null);

  useEffect(() => {
    const sync = () => setLocal(getLocalOrders());
    sync();
    window.addEventListener("foodstore:orders", sync);
    return () => window.removeEventListener("foodstore:orders", sync);
  }, []);

  const all: Pedido[] = [...local, ...(pedidos.data ?? [])].filter((p) => p.idUsuario === user?.id);
  const prodMap = new Map((productos.data ?? []).map((p) => [p.id, p]));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container-page flex-1 py-8">
        <h1 className="font-display text-3xl font-semibold">Mis pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Historial completo de tus pedidos.</p>

        {pedidos.isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Cargando…</div>
        ) : all.length === 0 ? (
          <div className="card-surface mt-8 p-12 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Todavía no tenés pedidos.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {all.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="card-surface p-5 text-left transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pedido</p>
                    <p className="font-display text-xl font-semibold">#{p.id}</p>
                    <p className="text-xs text-muted-foreground">{formatFecha(p.fecha)}</p>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {p.detalles.slice(0, 3).map((d) => (
                    <li key={d.idProducto}>
                      {d.cantidad}× {prodMap.get(d.idProducto)?.nombre ?? `Producto ${d.idProducto}`}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-lg font-semibold text-primary">{formatARS(p.total)}</p>
              </button>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />

      {selected && (
        <OrderModal pedido={selected} onClose={() => setSelected(null)} prodMap={prodMap} />
      )}
    </div>
  );
}

function OrderModal({
  pedido,
  onClose,
  prodMap,
}: {
  pedido: Pedido;
  onClose: () => void;
  prodMap: Map<number, { nombre: string; imagen: string }>;
}) {
  const subtotal = pedido.detalles.reduce((a, b) => a + b.subtotal, 0);
  const envio = Math.max(0, pedido.total - subtotal);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 p-4" onClick={onClose}>
      <div className="card-surface max-h-[90vh] w-full max-w-lg overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pedido</p>
            <h2 className="font-display text-2xl font-semibold">#{pedido.id}</h2>
            <p className="text-sm text-muted-foreground">{formatFecha(pedido.fecha)}</p>
          </div>
          <EstadoBadge estado={pedido.estado} />
        </div>

        {(pedido.direccion || pedido.telefono) && (
          <section className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
            <p className="mb-2 font-semibold">📍 Información de entrega</p>
            {pedido.direccion && <p><span className="text-muted-foreground">Dirección:</span> {pedido.direccion}</p>}
            {pedido.telefono && <p><span className="text-muted-foreground">Teléfono:</span> {pedido.telefono}</p>}
            <p><span className="text-muted-foreground">Método de pago:</span> {pedido.formaPago.replace("_", " ")}</p>
            {pedido.notas && <p><span className="text-muted-foreground">Notas:</span> {pedido.notas}</p>}
          </section>
        )}

        <p className="mt-4 mb-2 font-semibold">🍽️ Productos</p>
        <ul className="divide-y divide-border">
          {pedido.detalles.map((d) => {
            const p = prodMap.get(d.idProducto);
            return (
              <li key={d.idProducto} className="flex items-center gap-3 py-3">
                {p?.imagen && <img src={p.imagen} alt="" className="h-12 w-12 rounded-md object-cover" />}
                <div className="flex-1">
                  <p className="font-medium">{p?.nombre ?? `Producto ${d.idProducto}`}</p>
                  <p className="text-xs text-muted-foreground">Cantidad: {d.cantidad} × {formatARS(d.subtotal / d.cantidad)}</p>
                </div>
                <p className="font-semibold text-primary">{formatARS(d.subtotal)}</p>
              </li>
            );
          })}
        </ul>

        <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal:</dt><dd>{formatARS(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Envío:</dt><dd>{formatARS(envio)}</dd></div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary"><dt>Total:</dt><dd>{formatARS(pedido.total)}</dd></div>
        </dl>

        {pedido.estado === "PENDIENTE" && (
          <div className="mt-4 rounded-lg bg-warning/15 p-3 text-sm">
            <p className="font-semibold">⏳ Tu pedido está siendo procesado</p>
            <p className="text-xs text-muted-foreground">Te notificaremos cuando esté listo para entrega.</p>
          </div>
        )}

        <button onClick={onClose} className="btn-primary mt-6 w-full">Cerrar</button>
      </div>
    </div>
  );
}

