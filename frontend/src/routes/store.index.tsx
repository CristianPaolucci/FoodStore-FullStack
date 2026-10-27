import { createFileRoute } from "@tanstack/react-router";
import StoreHomePage from "@/pages/store/home/Home";

export const Route = createFileRoute("/store/")({
  head: () => ({
    meta: [
      { title: "Catálogo · Food Store" },
      { name: "description", content: "Explorá nuestro catálogo de hamburguesas, pizzas, pastas y más." },
    ],
  }),
  component: StoreHomePage,
});
