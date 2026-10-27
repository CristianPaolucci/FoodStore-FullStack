import { useQuery } from "@tanstack/react-query";
import { FolderTree, Pizza, ClipboardList, CheckCircle2 } from "lucide-react";
import { fetchCategorias, fetchPedidos, fetchProductos, formatARS } from "@/utils/api";
import { EstadoBadge } from "@/components/foodstore/EstadoBadge";
import type { EstadoPedido } from "@/types";

export default function AdminHomePage() {
  const cats = useQuery({ queryKey: ["categorias"], queryFn: fetchCategorias });
  const prods = useQuery({ queryKey: ["productos"], queryFn: fetchProductos });
  const peds = useQuery({ queryKey: ["pedidos"], queryFn: fetchPedidos });

  const totalCats = cats.data?.filter((c) => !c.eliminado).length ?? 0;
  const totalProds = prods.data?.filter((p) => !p.eliminado).length ?? 0;
  const disponibles = prods.data?.filter((p) => !p.eliminado && p.disponible).length ?? 0;
  const totalPeds = peds.data?.length ?? 0;
  const totalVendido = peds.data?.filter((p) => p.estado !== "CANCELADO").reduce((a, b) => a + b.total, 0) ?? 0;

  const porEstado = (peds.data ?? []).reduce<Record<EstadoPedido, number>>(
    (acc, p) => ({ ...acc, [p.estado]: (acc[p.estado] ?? 0) + 1 }),
    { PENDIENTE: 0, CONFIRMADO: 0, TERMINADO: 0, CANCELADO: 0 },
  );

  const stats = [
    { label: "Categorías", value: totalCats, icon: FolderTree, color: "bg-accent/40 text-accent-foreground" },
    { label: "Productos", value: totalProds, icon: Pizza, color: "bg-primary/15 text-primary" },
    { label: "Pedidos", value: totalPeds, icon: ClipboardList, color: "bg-info/15 text-[oklch(0.4_0.13_240)]" },
    { label: "Disponibles", value: disponibles, icon: CheckCircle2, color: "bg-success/15 text-[oklch(0.4_0.14_150)]" },
  ];

  return (
    <div className="p-6 lg:p-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general del sistema Food Store.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${s.color}`}><s.icon className="h-4 w-4" /></span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-semibold">Pedidos por estado</h2>
          <ul className="mt-4 space-y-3">
            {(Object.keys(porEstado) as EstadoPedido[]).map((e) => (
              <li key={e} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                <EstadoBadge estado={e} />
                <span className="text-sm font-semibold">{porEstado[e]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-surface p-6">
          <h2 className="font-display text-xl font-semibold">Resumen comercial</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Productos activos</dt><dd className="font-semibold">{disponibles}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Productos sin stock</dt><dd className="font-semibold">{(prods.data ?? []).filter((p) => !p.eliminado && (!p.disponible || p.stock === 0)).length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Categorías activas</dt><dd className="font-semibold">{totalCats}</dd></div>
            <div className="flex justify-between border-t border-border pt-3"><dt className="text-muted-foreground">Vendido (sin cancelados)</dt><dd className="text-lg font-semibold text-primary">{formatARS(totalVendido)}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}
