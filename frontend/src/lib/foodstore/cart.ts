import type { CartItem, Pedido } from "./types";

const CART_KEY = "foodstore:cart";
const ORDERS_KEY = "foodstore:orders";

function emit() {
  window.dispatchEvent(new Event("foodstore:cart"));
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  emit();
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const i = cart.findIndex((c) => c.idProducto === item.idProducto);
  if (i >= 0) {
    cart[i].cantidad = Math.min(cart[i].cantidad + item.cantidad, item.stock);
  } else {
    cart.push(item);
  }
  setCart(cart);
}

export function updateQty(idProducto: number, cantidad: number) {
  const cart = getCart().map((c) =>
    c.idProducto === idProducto ? { ...c, cantidad: Math.max(1, Math.min(cantidad, c.stock)) } : c,
  );
  setCart(cart);
}

export function removeFromCart(idProducto: number) {
  setCart(getCart().filter((c) => c.idProducto !== idProducto));
}

export function clearCart() {
  setCart([]);
}

export function cartCount() {
  return getCart().reduce((acc, c) => acc + c.cantidad, 0);
}

export function cartSubtotal() {
  return getCart().reduce((acc, c) => acc + c.cantidad * c.precio, 0);
}

// Local orders (created in-session, layered on top of pedidos.json)
export function getLocalOrders(): Pedido[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Pedido[]) : [];
  } catch {
    return [];
  }
}

export function addLocalOrder(p: Pedido) {
  const all = getLocalOrders();
  all.unshift(p);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("foodstore:orders"));
}

export function updateLocalOrderEstado(id: number, estado: Pedido["estado"]) {
  const all = getLocalOrders().map((o) => (o.id === id ? { ...o, estado } : o));
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("foodstore:orders"));
}
