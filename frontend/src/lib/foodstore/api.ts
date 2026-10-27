import type { Categoria, Pedido, Producto, Usuario } from "./types";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Error cargando ${path}`);
  return (await res.json()) as T;
}

export const fetchCategorias = () => getJSON<Categoria[]>("/data/categorias.json");
export const fetchProductos = () => getJSON<Producto[]>("/data/productos.json");
export const fetchUsuarios = () => getJSON<Usuario[]>("/data/usuarios.json");
export const fetchPedidos = () => getJSON<Pedido[]>("/data/pedidos.json");

export const formatARS = (v: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(v);

export const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const ENVIO_FIJO = 1500;
