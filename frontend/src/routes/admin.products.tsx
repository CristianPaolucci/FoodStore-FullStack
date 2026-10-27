import { createFileRoute } from "@tanstack/react-router";
import ProductsAdminPage from "@/pages/admin/products/Products";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Productos · Admin" }, { name: "description", content: "Gestión de productos." }] }),
  component: ProductsAdminPage,
});
