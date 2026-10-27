import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/foodstore/SiteShell";
import { getSession } from "@/lib/foodstore/auth";

export const Route = createFileRoute("/store")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getSession()) {
      throw redirect({ to: "/login" });
    }
  },
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
