import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/pages/auth/login/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · Food Store" },
      { name: "description", content: "Iniciá sesión en Food Store para hacer tu pedido o gestionar la tienda." },
    ],
  }),
  component: LoginPage,
});
