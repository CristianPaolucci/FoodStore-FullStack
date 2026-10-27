export type Rol = "ADMIN" | "USUARIO";

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  eliminado: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  eliminado: boolean;
  categoriaId: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  password?: string;
  rol: Rol;
}

export type EstadoPedido = "PENDIENTE" | "CONFIRMADO" | "TERMINADO" | "CANCELADO";
export type FormaPago = "EFECTIVO" | "TARJETA" | "MERCADO_PAGO";

export interface DetallePedido {
  idProducto: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  formaPago: FormaPago;
  idUsuario: number;
  detalles: DetallePedido[];
  direccion?: string;
  telefono?: string;
  notas?: string;
}

export interface CartItem {
  idProducto: number;
  nombre: string;
  imagen: string;
  precio: number;
  cantidad: number;
  stock: number;
}
