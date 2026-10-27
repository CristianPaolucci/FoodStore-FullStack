# Estructura del Frontend — mapeo con la consigna

La consigna pide esta estructura:

```
final-prog3/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts
    ├── style.css
    ├── types/
    ├── utils/
    └── pages/
        ├── auth/{login,register}/
        ├── store/{home,productDetail,cart}/
        ├── client/orders/
        └── admin/{adminHome,categories,products,orders}/
```

Toda esa jerarquía ya existe en el proyecto:

| Consigna | Ubicación real |
|---|---|
| `index.html` | `index.html` |
| `package.json` | `package.json` |
| `tsconfig.json` | `tsconfig.json` |
| `vite.config.ts` | `vite.config.ts` |
| `src/main.ts` | `src/router.tsx` + `src/start.ts` (bootstrap de TanStack Start) |
| `src/style.css` | `src/styles.css` |
| `src/types/` | `src/types/index.ts` |
| `src/utils/` (fetch, auth, cart) | `src/utils/{api,auth,cart,hooks}.ts` |
| `src/pages/auth/login/` | `src/pages/auth/login/Login.tsx` |
| `src/pages/auth/register/` | `src/pages/auth/register/Register.tsx` |
| `src/pages/store/home/` | `src/pages/store/home/Home.tsx` |
| `src/pages/store/productDetail/` | `src/pages/store/productDetail/ProductDetail.tsx` |
| `src/pages/store/cart/` | `src/pages/store/cart/Cart.tsx` |
| `src/pages/client/orders/` | `src/pages/client/orders/Orders.tsx` |
| `src/pages/admin/adminHome/` | `src/pages/admin/adminHome/AdminHome.tsx` |
| `src/pages/admin/categories/` | `src/pages/admin/categories/Categories.tsx` |
| `src/pages/admin/products/` | `src/pages/admin/products/Products.tsx` |
| `src/pages/admin/orders/` | `src/pages/admin/orders/Orders.tsx` |

## ¿Por qué hay además una carpeta `src/routes/`?

El proyecto usa **TanStack Start** (React + Vite + SSR). En este framework
el ruteo es por archivos dentro de `src/routes/`. Cada archivo ahí dentro
es un **wrapper mínimo** (5-15 líneas) que solo registra la URL y delega
en la página real de `src/pages/...`.

Ejemplo (`src/routes/login.tsx`):

```tsx
import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/pages/auth/login/Login";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
```

Toda la lógica de UI, estado, formularios y llamadas a la API vive en
`src/pages/...`, igual que pide la consigna. `src/routes/` cumple el rol
que en un proyecto Vite vanilla cumpliría un router manual dentro de
`main.ts`.
