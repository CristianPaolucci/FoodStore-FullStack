import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, LogOut, ChefHat, LayoutDashboard, Package } from "lucide-react";
import { clearSession } from "@/lib/foodstore/auth";
import { useCartCount, useSession } from "@/lib/foodstore/hooks";

export function SiteHeader() {
  const user = useSession();
  const cartN = useCartCount();
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/store" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Food Store</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/store" className="btn-ghost" activeProps={{ className: "btn-ghost bg-secondary" }}>
            Tienda
          </Link>
          {user?.rol === "USUARIO" && (
            <Link to="/client/orders" className="btn-ghost" activeProps={{ className: "btn-ghost bg-secondary" }}>
              <Package className="h-4 w-4" /> Mis pedidos
            </Link>
          )}
          {user?.rol === "ADMIN" && (
            <Link to="/admin" className="btn-ghost" activeProps={{ className: "btn-ghost bg-secondary" }}>
              <LayoutDashboard className="h-4 w-4" /> Panel Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user?.rol === "USUARIO" && (
            <Link to="/store/cart" className="relative btn-ghost" aria-label="Carrito">
              <ShoppingBag className="h-5 w-5" />
              {cartN > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {cartN}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.nombre} {user.apellido}
              </span>
              <button onClick={logout} className="btn-secondary" aria-label="Cerrar sesión">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Food Store · Sistema de Gestión de Pedidos</p>
        <p>TUP · Programación 3 · Trabajo Final</p>
      </div>
    </footer>
  );
}
