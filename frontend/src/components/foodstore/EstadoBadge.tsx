import type { EstadoPedido } from "@/lib/foodstore/types";

const map: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-warning/20 text-[oklch(0.45_0.12_75)] ring-1 ring-warning/40",
  CONFIRMADO: "bg-info/15 text-[oklch(0.4_0.13_240)] ring-1 ring-info/30",
  TERMINADO: "bg-success/15 text-[oklch(0.4_0.14_150)] ring-1 ring-success/30",
  CANCELADO: "bg-destructive/15 text-destructive ring-1 ring-destructive/30",
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  return <span className={`badge-base ${map[estado]}`}>{estado}</span>;
}
