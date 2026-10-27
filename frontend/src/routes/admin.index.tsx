import { createFileRoute } from "@tanstack/react-router";
import AdminHomePage from "@/pages/admin/adminHome/AdminHome";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Panel Admin · Food Store" }, { name: "description", content: "Panel de administración Food Store." }],
  }),
  component: AdminHomePage,
});
