import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { fetchCategorias, fetchProductos, formatARS } from "@/utils/api";
import type { Producto } from "@/types";

export default function ProductsAdminPage() {
  const cats = useQuery({ queryKey: ["categorias"], queryFn: fetchCategorias });
  const prods = useQuery({ queryKey: ["productos"], queryFn: fetchProductos });
  const [items, setItems] = useState<Producto[]>([]);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { if (prods.data) setItems(prods.data); }, [prods.data]);

  const catName = (id: number) => cats.data?.find((c) => c.id === id)?.nombre ?? "—";

  const onSave = (p: Producto) => {
    setItems((prev) =>
      prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, { ...p, id: Date.now() }],
    );
    setOpen(false); setEditing(null);
  };
  const onDelete = (id: number) => { if (confirm("¿Eliminar este producto?")) setItems((p) => p.filter((x) => x.id !== id)); };

  return (
    <div className="p-6 lg:p-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Gestión de productos</h1>
          <p className="text-sm text-muted-foreground">{items.filter((i) => !i.eliminado).length} productos</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </header>

      {prods.isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Cargando…</div>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.filter((p) => !p.eliminado).map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-muted-foreground">{p.id}</td>
                  <td className="px-4 py-3"><img src={p.imagen} alt="" className="h-12 w-12 rounded-md object-cover" /></td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.nombre}</div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">{p.descripcion}</div>
                  </td>
                  <td className="px-4 py-3">{catName(p.categoriaId)}</td>
                  <td className="px-4 py-3 font-semibold">{formatARS(p.precio)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-base ${p.disponible ? "bg-success/15 text-[oklch(0.4_0.14_150)]" : "bg-muted text-muted-foreground"}`}>
                      {p.disponible ? "Disponible" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(p); setOpen(true); }} className="btn-ghost"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(p.id)} className="btn-ghost text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <ProductModal
          initial={editing}
          categorias={cats.data ?? []}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSave={onSave}
        />
      )}
    </div>
  );
}

function ProductModal({
  initial, categorias, onClose, onSave,
}: {
  initial: Producto | null;
  categorias: { id: number; nombre: string }[];
  onClose: () => void;
  onSave: (p: Producto) => void;
}) {
  const [form, setForm] = useState<Producto>(
    initial ?? {
      id: 0, nombre: "", precio: 0, descripcion: "", stock: 0, imagen: "",
      disponible: true, eliminado: false, categoriaId: categorias[0]?.id ?? 1,
    },
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 p-4" onClick={onClose}>
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(form); }}
        onClick={(e) => e.stopPropagation()}
        className="card-surface max-h-[90vh] w-full max-w-lg overflow-auto p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{initial ? "Editar producto" : "Nuevo producto"}</h2>
          <button type="button" onClick={onClose} className="btn-ghost"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input className="input-field" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Descripción</label>
            <textarea className="input-field" rows={2} required value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Precio</label>
            <input type="number" min={0} className="input-field" required value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Stock</label>
            <input type="number" min={0} className="input-field" required value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Categoría</label>
            <select className="input-field" value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">URL de imagen</label>
            <input className="input-field" required value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })} />
            Producto disponible
          </label>
        </div>
        <button type="submit" className="btn-primary mt-6 w-full">Guardar</button>
      </form>
    </div>
  );
}
