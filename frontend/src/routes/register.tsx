import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "@/pages/auth/register/Register";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Crear cuenta · Food Store" },
      { name: "description", content: "Registrate en Food Store y empezá a pedir." },
    ],
  }),
  component: RegisterPage,
});
