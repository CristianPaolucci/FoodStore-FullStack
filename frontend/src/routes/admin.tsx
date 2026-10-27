import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { ChefHat, LayoutDashboard, FolderTree, Pizza, ClipboardList, Store, LogOut } from "lucide-react";
import { clearSession, getSession } from "@/lib/foodstore/auth";
import { useSession } from "@/lib/foodstore/hooks";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const s = getSession();
      if (!s) throw redirect({ to: "/login" });
      if (s.rol !== "ADMIN") throw redirect({ to: "/store" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const user = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const nav: { to: "/admin" | "/admin/categories" | "/admin/products" | "/admin/orders"; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/categories", label: "Categorías", icon: FolderTree },
    { to: "/admin/products", label: "Productos", icon: Pizza },
    { to: "/admin/orders", label: "Pedidos", icon: ClipboardList },
  ];

  const logout = () => {
    clearSession();
    navigate({ to: "/login" });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-card lg:sticky lg:top-0 lg:h-screen">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold">Food Store</span>
          <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold uppercase">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
          <div className="my-2 border-t border-border" />
          <Link to="/store" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">
            <Store className="h-4 w-4" /> Ver tienda
          </Link>
        </nav>
        <div className="absolute bottom-0 hidden w-[260px] border-t border-border p-3 lg:block">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
              {user?.nombre?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.nombre} {user?.apellido}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.mail}</p>
            </div>
            <button onClick={logout} className="btn-ghost" aria-label="Salir">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="bg-background">
        <Outlet />
      </main>
    </div>
  );
}
