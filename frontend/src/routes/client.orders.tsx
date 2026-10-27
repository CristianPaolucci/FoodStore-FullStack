import { createFileRoute, redirect } from "@tanstack/react-router";
import ClientOrdersPage from "@/pages/client/orders/Orders";
import { getSession } from "@/utils/auth";

export const Route = createFileRoute("/client/orders")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const s = getSession();
      if (!s) throw redirect({ to: "/login" });
      if (s.rol !== "USUARIO") throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Mis pedidos · Food Store" },
      { name: "description", content: "Seguí el estado de tus pedidos en Food Store." },
    ],
  }),
  component: ClientOrdersPage,
});
