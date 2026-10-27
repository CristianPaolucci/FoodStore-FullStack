import { createFileRoute } from "@tanstack/react-router";
import CartPage from "@/pages/store/cart/Cart";

export const Route = createFileRoute("/store/cart")({
  head: () => ({
    meta: [
      { title: "Carrito · Food Store" },
      { name: "description", content: "Revisá tu carrito y confirmá tu pedido." },
    ],
  }),
  component: CartPage,
});
