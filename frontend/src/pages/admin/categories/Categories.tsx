import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { fetchCategorias } from "@/utils/api";
import type { Categoria } from "@/types";

export default function CategoriesAdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ["categorias"], queryFn: fetchCategorias });
  const [items, setItems] = useState<Categoria[]>([]);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { if (data) setItems(data); }, [data]);

  const onSave = (c: Categoria) => {
    setItems((prev) =>
      prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, { ...c, id: Date.now() }],
    );
    setOpen(false); setEditing(null);
  };

  const onDelete = (id: number) => {
    if (confirm("¿Eliminar esta categoría?")) setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="p-6 lg:p-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Gestión de categorías</h1>
          <p className="text-sm text-muted-foreground">{items.length} categorías</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Nueva categoría
        </button>
      </header>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Cargando…</div>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.filter((c) => !c.eliminado).map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-3"><img src={c.imagen} alt="" className="h-12 w-12 rounded-md object-cover" /></td>
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.descripcion}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(c); setOpen(true); }} className="btn-ghost"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(c.id)} className="btn-ghost text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <CategoryModal
          initial={editing}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSave={onSave}
        />
      )}
    </div>
  );
}

function CategoryModal({ initial, onClose, onSave }: { initial: Categoria | null; onClose: () => void; onSave: (c: Categoria) => void }) {
  const [form, setForm] = useState<Categoria>(
    initial ?? { id: 0, nombre: "", descripcion: "", imagen: "", eliminado: false },
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 p-4" onClick={onClose}>
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(form); }}
        onClick={(e) => e.stopPropagation()}
        className="card-surface w-full max-w-md p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{initial ? "Editar categoría" : "Nueva categoría"}</h2>
          <button type="button" onClick={onClose} className="btn-ghost"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input className="input-field" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Descripción</label>
            <textarea className="input-field" rows={3} required value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">URL de imagen</label>
            <input className="input-field" required value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn-primary mt-6 w-full">Guardar</button>
      </form>
    </div>
  );
}
