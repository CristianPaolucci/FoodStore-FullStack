import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { fetchPedidos, fetchProductos, fetchUsuarios, formatARS, formatFecha } from "@/utils/api";
import { EstadoBadge } from "@/components/foodstore/EstadoBadge";
import { getLocalOrders, updateLocalOrderEstado } from "@/utils/cart";
import { getSession } from "@/utils/auth";
import type { EstadoPedido, Pedido } from "@/types";

const ESTADOS: EstadoPedido[] = ["PENDIENTE", "CONFIRMADO", "TERMINADO", "CANCELADO"];

export default function OrdersAdminPage() {
  const peds = useQuery({ queryKey: ["pedidos"], queryFn: fetchPedidos });
  const users = useQuery({ queryKey: ["usuarios"], queryFn: fetchUsuarios });
  const prods = useQuery({ queryKey: ["productos"], queryFn: fetchProductos });

  // Pedidos del JSON (estado mutable solo en memoria)
  const [jsonItems, setJsonItems] = useState<Pedido[]>([]);
  // Pedidos creados por usuarios (localStorage)
  const [localItems, setLocalItems] = useState<Pedido[]>([]);
  const [filter, setFilter] = useState<EstadoPedido | "ALL">("ALL");
  const [selected, setSelected] = useState<Pedido | null>(null);

  useEffect(() => { if (peds.data) setJsonItems(peds.data); }, [peds.data]);

  useEffect(() => {
    const sync = () => setLocalItems(getLocalOrders());
    sync();
    window.addEventListener("foodstore:orders", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("foodstore:orders", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const userMap = useMemo(() => {
    const m = new Map((users.data ?? []).map((u) => [u.id, u]));
    // Incluir el usuario logueado por si registró localmente y no está en el JSON
    const me = getSession();
    if (me && !m.has(me.id)) m.set(me.id, { ...me, password: "" });
    return m;
  }, [users.data]);
  const prodMap = useMemo(() => new Map((prods.data ?? []).map((p) => [p.id, p])), [prods.data]);

  const items: Pedido[] = [...localItems, ...jsonItems];
  const filtered = items
    .filter((p) => filter === "ALL" || p.estado === filter)
    .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));

  const isLocal = (id: number) => localItems.some((p) => p.id === id);

  const cambiarEstado = (id: number, estado: EstadoPedido) => {
    if (isLocal(id)) {
      updateLocalOrderEstado(id, estado);
    } else {
      setJsonItems((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
    }
    setSelected((s) => (s && s.id === id ? { ...s, estado } : s));
  };

  return (
    <div className="p-6 lg:p-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Gestión de pedidos</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} pedidos</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as EstadoPedido | "ALL")} className="input-field max-w-xs">
          <option value="ALL">Todos los pedidos</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </header>

      {peds.isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Cargando…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const u = userMap.get(p.idUsuario);
            return (
              <button key={p.id} onClick={() => setSelected(p)} className="card-surface p-5 text-left transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Pedido</p>
                    <p className="font-display text-lg font-semibold">#{p.id}</p>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </div>
                <p className="mt-2 text-sm font-medium">Cliente: {u ? `${u.nombre} ${u.apellido}` : "Usuario"}</p>
                <p className="text-xs text-muted-foreground">{formatFecha(p.fecha)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{p.detalles.length} producto(s)</span>
                  <span className="text-lg font-semibold text-primary">{formatARS(p.total)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 p-4" onClick={() => setSelected(null)}>
          <div className="card-surface max-h-[90vh] w-full max-w-lg overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Detalle del pedido</p>
                <h2 className="font-display text-2xl font-semibold">#{selected.id}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost"><X className="h-4 w-4" /></button>
            </div>

            <section className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
              <p><span className="font-semibold">Cliente:</span> {userMap.get(selected.idUsuario)?.nombre} {userMap.get(selected.idUsuario)?.apellido}</p>
              <p><span className="font-semibold">Fecha:</span> {formatFecha(selected.fecha)}</p>
              {selected.telefono && <p><span className="font-semibold">Teléfono:</span> {selected.telefono}</p>}
              {selected.direccion && <p><span className="font-semibold">Dirección:</span> {selected.direccion}</p>}
              <p><span className="font-semibold">Método de pago:</span> {selected.formaPago.replace("_", " ")}</p>
              {selected.notas && <p><span className="font-semibold">Notas:</span> {selected.notas}</p>}
            </section>

            <p className="mt-4 mb-2 font-semibold">Productos:</p>
            <ul className="divide-y divide-border">
              {selected.detalles.map((d) => {
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

            {(() => {
              const subtotal = selected.detalles.reduce((a, b) => a + b.subtotal, 0);
              const envio = Math.max(0, selected.total - subtotal);
              return (
                <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal:</dt><dd>{formatARS(subtotal)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Envío:</dt><dd>{formatARS(envio)}</dd></div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary"><dt>Total:</dt><dd>{formatARS(selected.total)}</dd></div>
                </dl>
              );
            })()}

            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm font-medium">Cambiar estado:</label>
              <select
                value={selected.estado}
                onChange={(e) => cambiarEstado(selected.id, e.target.value as EstadoPedido)}
                className="input-field max-w-[200px]"
              >
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <button onClick={() => setSelected(null)} className="btn-primary mt-4 w-full bg-success text-white hover:opacity-90">
              Actualizar estado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
