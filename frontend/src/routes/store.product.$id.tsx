import { createFileRoute } from "@tanstack/react-router";
import ProductDetailPage from "@/pages/store/productDetail/ProductDetail";

export const Route = createFileRoute("/store/product/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Producto · Food Store` },
      { name: "description", content: `Detalle del producto ${params.id} en Food Store.` },
    ],
  }),
  component: ProductDetailPage,
});
