import { createFileRoute } from "@tanstack/react-router";
import CategoriesAdminPage from "@/pages/admin/categories/Categories";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categorías · Admin" }, { name: "description", content: "Gestión de categorías." }] }),
  component: CategoriesAdminPage,
});
