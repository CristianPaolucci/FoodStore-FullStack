import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Check, X } from "lucide-react";
import { useCart } from "@/utils/hooks";
import { addLocalOrder, cartSubtotal, clearCart, removeFromCart, updateQty } from "@/utils/cart";
import { ENVIO_FIJO, formatARS } from "@/utils/api";
import { getSession } from "@/utils/auth";
import type { FormaPago, Pedido } from "@/types";

export default function CartPage() {
  const items = useCart();
  const navigate = useNavigate();
  const [openCheckout, setOpenCheckout] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const subtotal = cartSubtotal();
  const total = subtotal + ENVIO_FIJO;

  const onConfirm = (data: { telefono: string; direccion: string; pago: FormaPago; notas: string }) => {
    const user = getSession();
    if (!user) return;
    const pedido: Pedido = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      estado: "PENDIENTE",
      total,
      formaPago: data.pago,
      idUsuario: user.id,
      telefono: data.telefono,
      direccion: data.direccion,
      notas: data.notas || undefined,
      detalles: items.map((i) => ({
        idProducto: i.idProducto,
        cantidad: i.cantidad,
        subtotal: i.cantidad * i.precio,
      })),
    };
    addLocalOrder(pedido);
    clearCart();
    setOpenCheckout(false);
    setConfirmado(true);
    setTimeout(() => navigate({ to: "/client/orders" }), 1500);
  };

  if (confirmado) {
    return (
      <main className="container-page py-20">
        <div className="card-surface mx-auto max-w-md p-10 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-success/20 text-[oklch(0.4_0.14_150)]">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-semibold">¡Pedido confirmado!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Te llevamos a tus pedidos…</p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container-page py-20">
        <div className="card-surface mx-auto max-w-md p-10 text-center">
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl font-semibold">Tu carrito está vacío</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sumá productos desde el catálogo.</p>
          <Link to="/store" className="btn-primary mt-6">Ir a la tienda</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page py-8">
      <h1 className="font-display text-3xl font-semibold">Mi carrito</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card-surface divide-y divide-border">
          {items.map((i) => (
            <div key={i.idProducto} className="flex gap-4 p-4">
              <img src={i.imagen} alt={i.nombre} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{i.nombre}</p>
                <p className="text-sm text-muted-foreground">{formatARS(i.precio)} c/u</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-border bg-card">
                    <button onClick={() => updateQty(i.idProducto, i.cantidad - 1)} className="px-2 py-1 hover:bg-secondary">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">{i.cantidad}</span>
                    <button
                      onClick={() => updateQty(i.idProducto, i.cantidad + 1)}
                      disabled={i.cantidad >= i.stock}
                      className="px-2 py-1 hover:bg-secondary disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(i.idProducto)}
                    className="text-sm text-destructive hover:underline"
                  >
                    <Trash2 className="inline h-3.5 w-3.5" /> Eliminar
                  </button>
                </div>
              </div>
              <p className="font-semibold">{formatARS(i.precio * i.cantidad)}</p>
            </div>
          ))}
        </div>

        <aside className="card-surface h-fit p-5">
          <h2 className="font-display text-xl font-semibold">Resumen del pedido</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatARS(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Envío</dt><dd>{formatARS(ENVIO_FIJO)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd className="text-primary">{formatARS(total)}</dd></div>
          </dl>

          <button onClick={() => setOpenCheckout(true)} className="btn-primary mt-6 w-full">
            Proceder al pago
          </button>
          <button onClick={() => clearCart()} className="btn-secondary mt-2 w-full text-destructive">
            <Trash2 className="h-4 w-4" /> Vaciar carrito
          </button>
        </aside>
      </div>

      {openCheckout && (
        <CheckoutModal total={total} onClose={() => setOpenCheckout(false)} onConfirm={onConfirm} />
      )}
    </main>
  );
}

function CheckoutModal({
  total,
  onClose,
  onConfirm,
}: {
  total: number;
  onClose: () => void;
  onConfirm: (d: { telefono: string; direccion: string; pago: FormaPago; notas: string }) => void;
}) {
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [pago, setPago] = useState<FormaPago | "">("");
  const [notas, setNotas] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!pago) return;
          onConfirm({ telefono, direccion, pago: pago as FormaPago, notas });
        }}
        className="card-surface max-h-[90vh] w-full max-w-md overflow-auto p-6"
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-display text-xl font-semibold">Completar pedido</h2>
          <button type="button" onClick={onClose} className="btn-ghost"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Teléfono</label>
            <input
              className="input-field"
              required
              placeholder="Ej: +54 9 261 123-4567"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Dirección de entrega</label>
            <textarea
              className="input-field"
              rows={2}
              required
              placeholder="Calle, número, piso, depto"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Método de pago</label>
            <select
              className="input-field"
              required
              value={pago}
              onChange={(e) => setPago(e.target.value as FormaPago)}
            >
              <option value="">Seleccione un método</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notas adicionales (opcional)</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Instrucciones especiales, timbre, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold text-primary">Total a pagar:</span>
          <span className="text-xl font-semibold text-primary">{formatARS(total)}</span>
        </div>

        <button type="submit" className="btn-primary mt-4 w-full bg-success text-white hover:opacity-90">
          Confirmar pedido
        </button>
      </form>
    </div>
  );
}
