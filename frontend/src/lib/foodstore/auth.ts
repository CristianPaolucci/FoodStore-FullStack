import type { Usuario } from "./types";

const KEY = "foodstore:user";

export type SessionUser = Omit<Usuario, "password">;

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(u: SessionUser) {
  window.localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new Event("foodstore:auth"));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("foodstore:auth"));
}
