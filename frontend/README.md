# Final Prog 3 · Food Store (Frontend)

Trabajo Final de Programación 3 — TUP.
Tienda online + panel de administración de pedidos.

## Stack
- TanStack Start (React 19 + Vite)
- Tailwind CSS v4
- TypeScript
- Datos mockeados en `public/data/*.json` + `localStorage` para sesión, carrito y pedidos creados.

## Cómo correrlo

```bash
npm install
npm run dev
```

Luego abrir: http://localhost:8080

## Build de producción

```bash
npm run build
npm run preview
```

## Estructura

```
src/
├── routes/      # rutas (file-based routing)
├── pages/       # componentes de cada pantalla
│   ├── auth/    # login, register
│   ├── store/   # home, productDetail, cart
│   ├── client/  # orders
│   └── admin/   # adminHome, categories, products, orders
├── components/  # UI compartida
├── lib/         # lógica de negocio
├── utils/       # helpers (api, auth, cart, hooks)
└── types/       # tipos TypeScript

public/data/     # datos iniciales mockeados
├── categorias.json
├── productos.json
├── usuarios.json
└── pedidos.json
```
Link al video:
https://drive.google.com/file/d/1drKym0XdZ_0qISIItYykdq8tQTH6Gbof/view?usp=drive_link