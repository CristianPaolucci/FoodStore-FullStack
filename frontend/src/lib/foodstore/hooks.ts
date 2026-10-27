import { useEffect, useState } from "react";
import { cartCount, getCart } from "./cart";
import { getSession, type SessionUser } from "./auth";

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(() => getSession());
  useEffect(() => {
    const sync = () => setUser(getSession());
    window.addEventListener("foodstore:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("foodstore:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return user;
}

export function useCartCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => setN(cartCount());
    sync();
    window.addEventListener("foodstore:cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("foodstore:cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return n;
}

export function useCart() {
  const [items, setItems] = useState(() => getCart());
  useEffect(() => {
    const sync = () => setItems(getCart());
    window.addEventListener("foodstore:cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("foodstore:cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return items;
}
