import { createFileRoute } from "@tanstack/react-router";
import OrdersAdminPage from "@/pages/admin/orders/Orders";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Pedidos · Admin" }, { name: "description", content: "Gestión de pedidos." }] }),
  component: OrdersAdminPage,
});
