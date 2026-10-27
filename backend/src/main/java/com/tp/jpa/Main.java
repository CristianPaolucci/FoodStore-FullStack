package com.tp.jpa;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.DetallePedido;
import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Producto;
import com.tp.jpa.model.Usuario;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Scanner;

public class Main {

    private static final Scanner SC = new Scanner(System.in);

    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        boolean salir = false;
        while (!salir) {
            System.out.println("\n========= FOOD STORE =========");
            System.out.println("1. Gestionar Categorías");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            switch (leerInt("Opción: ")) {
                case 1 -> menuCategorias();
                case 2 -> menuProductos();
                case 3 -> menuUsuarios();
                case 4 -> menuPedidos();
                case 5 -> menuReportes();
                case 0 -> salir = true;
                default -> System.out.println("Opción inválida.");
            }
        }
        JPAUtil.close();
        System.out.println("¡Hasta luego!");
    }

    // ============================================================
    // 5.1 CATEGORÍAS
    // ============================================================
    private static void menuCategorias() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- Categorías ---");
            System.out.println("1. Alta\n2. Modificar\n3. Baja lógica\n4. Listado\n0. Volver");
            switch (leerInt("Opción: ")) {
                case 1 -> altaCategoria();
                case 2 -> modificarCategoria();
                case 3 -> bajaCategoria();
                case 4 -> listarCategorias();
                case 0 -> volver = true;
                default -> System.out.println("Opción inválida.");
            }
        }
    }

    private static void altaCategoria() {
        String nombre = leerString("Nombre: ");
        if (nombre.isBlank()) { System.out.println("ERROR: el nombre es obligatorio."); return; }
        String descripcion = leerString("Descripción: ");
        Categoria c = new Categoria(nombre, descripcion);
        c = categoriaRepo.guardar(c);
        System.out.println("Categoría creada con ID: " + c.getId());
    }

    private static void modificarCategoria() {
        listarCategorias();
        Long id = leerLong("ID a modificar: ");
        Optional<Categoria> opt = categoriaRepo.buscarPorId(id);
        if (opt.isEmpty() || opt.get().isEliminado()) {
            System.out.println("ERROR: no existe una categoría activa con ese ID."); return;
        }
        Categoria c = opt.get();
        System.out.println("Actual nombre: " + c.getNombre());
        String nn = leerString("Nuevo nombre (Enter conserva): ");
        if (!nn.isBlank()) c.setNombre(nn);
        System.out.println("Actual descripción: " + c.getDescripcion());
        String nd = leerString("Nueva descripción (Enter conserva): ");
        if (!nd.isBlank()) c.setDescripcion(nd);
        categoriaRepo.guardar(c);
        System.out.println("Categoría actualizada.");
    }

    private static void bajaCategoria() {
        Long id = leerLong("ID a dar de baja: ");
        Optional<Categoria> opt = categoriaRepo.buscarPorId(id);
        boolean ok = categoriaRepo.eliminarLogico(id);
        if (!ok) { System.out.println("ERROR: no encontrada o ya dada de baja."); return; }
        System.out.println("Categoría dada de baja: " + opt.get().getNombre());
    }

    private static void listarCategorias() {
        List<Categoria> lista = categoriaRepo.listarActivos();
        if (lista.isEmpty()) { System.out.println("(no hay categorías activas)"); return; }
        System.out.println("\nID | Nombre | Descripción");
        for (Categoria c : lista) {
            System.out.printf("%d | %s | %s%n", c.getId(), c.getNombre(), c.getDescripcion());
        }
    }

    // ============================================================
    // 5.2 PRODUCTOS
    // ============================================================
    private static void menuProductos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- Productos ---");
            System.out.println("1. Alta\n2. Modificar\n3. Baja lógica\n4. Listado\n0. Volver");
            switch (leerInt("Opción: ")) {
                case 1 -> altaProducto();
                case 2 -> modificarProducto();
                case 3 -> bajaProducto();
                case 4 -> listarProductos();
                case 0 -> volver = true;
                default -> System.out.println("Opción inválida.");
            }
        }
    }

    private static void altaProducto() {
        List<Categoria> cats = categoriaRepo.listarActivos();
        if (cats.isEmpty()) { System.out.println("ERROR: no hay categorías activas. Cree una primero."); return; }
        listarCategorias();
        Long catId = leerLong("ID de categoría: ");
        Optional<Categoria> oc = categoriaRepo.buscarPorId(catId);
        if (oc.isEmpty() || oc.get().isEliminado()) { System.out.println("ERROR: categoría inválida."); return; }

        String nombre = leerString("Nombre: ");
        if (nombre.isBlank()) { System.out.println("ERROR: el nombre es obligatorio."); return; }
        String desc = leerString("Descripción: ");
        double precio = leerDouble("Precio: ");
        if (precio <= 0) { System.out.println("ERROR: precio debe ser mayor a 0."); return; }
        int stock = leerInt("Stock: ");
        if (stock < 0) { System.out.println("ERROR: stock no puede ser negativo."); return; }
        String imagen = leerString("Imagen (opcional): ");
        String d = leerString("¿Disponible? (S/N, Enter=S): ");
        boolean disp = d.isBlank() || d.equalsIgnoreCase("S");

        Producto p = new Producto(nombre, precio, desc, stock, imagen, disp, oc.get());
        p = productoRepo.guardar(p);
        System.out.println("Producto creado ID=" + p.getId() + " en categoría '" + oc.get().getNombre() + "'");
    }

    private static void modificarProducto() {
        listarProductos();
        Long id = leerLong("ID a modificar: ");
        Optional<Producto> opt = productoRepo.buscarPorId(id);
        if (opt.isEmpty() || opt.get().isEliminado()) { System.out.println("ERROR: producto inexistente o dado de baja."); return; }
        Producto p = opt.get();

        System.out.println("Actual nombre: " + p.getNombre());
        String nn = leerString("Nuevo nombre (Enter conserva): ");
        if (!nn.isBlank()) p.setNombre(nn);

        System.out.println("Actual precio: " + p.getPrecio());
        String np = leerString("Nuevo precio (Enter conserva): ");
        if (!np.isBlank()) {
            try {
                double v = Double.parseDouble(np);
                if (v <= 0) { System.out.println("ERROR: precio debe ser > 0."); return; }
                p.setPrecio(v);
            } catch (NumberFormatException e) { System.out.println("ERROR: precio inválido."); return; }
        }

        System.out.println("Actual stock: " + p.getStock());
        String ns = leerString("Nuevo stock (Enter conserva): ");
        if (!ns.isBlank()) {
            try {
                int v = Integer.parseInt(ns);
                if (v < 0) { System.out.println("ERROR: stock no puede ser negativo."); return; }
                p.setStock(v);
            } catch (NumberFormatException e) { System.out.println("ERROR: stock inválido."); return; }
        }

        productoRepo.guardar(p);
        System.out.println("Producto actualizado.");
    }

    private static void bajaProducto() {
        Long id = leerLong("ID a dar de baja: ");
        Optional<Producto> opt = productoRepo.buscarPorId(id);
        boolean ok = productoRepo.eliminarLogico(id);
        if (!ok) { System.out.println("ERROR: no encontrado o ya dado de baja."); return; }
        System.out.println("Producto dado de baja: " + opt.get().getNombre());
    }

    private static void listarProductos() {
        List<Producto> lista = productoRepo.listarActivos();
        if (lista.isEmpty()) { System.out.println("(no hay productos activos)"); return; }
        System.out.println("\nID | Nombre | Precio | Stock | Disp | Categoría");
        for (Producto p : lista) {
            String cat = p.getCategoria() != null ? p.getCategoria().getNombre() : "-";
            System.out.printf("%d | %s | %.2f | %d | %s | %s%n",
                    p.getId(), p.getNombre(), p.getPrecio(), p.getStock(),
                    Boolean.TRUE.equals(p.getDisponible()) ? "Sí" : "No", cat);
        }
    }

    // ============================================================
    // 5.3 USUARIOS
    // ============================================================
    private static void menuUsuarios() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- Usuarios ---");
            System.out.println("1. Alta\n2. Modificar\n3. Baja lógica\n4. Listado\n5. Buscar por mail\n0. Volver");
            switch (leerInt("Opción: ")) {
                case 1 -> altaUsuario();
                case 2 -> modificarUsuario();
                case 3 -> bajaUsuario();
                case 4 -> listarUsuarios();
                case 5 -> buscarUsuarioPorMail();
                case 0 -> volver = true;
                default -> System.out.println("Opción inválida.");
            }
        }
    }

    private static void altaUsuario() {
        String nombre = leerString("Nombre: ");
        String apellido = leerString("Apellido: ");
        String mail = leerString("Mail: ");
        if (mail.isBlank()) { System.out.println("ERROR: mail obligatorio."); return; }
        if (usuarioRepo.buscarPorMail(mail).isPresent()) {
            System.out.println("ERROR: ya existe un usuario activo con ese mail."); return;
        }
        String celular = leerString("Celular (opcional): ");
        String pass = leerString("Contraseña: ");
        Rol rol = leerRol();
        Usuario u = new Usuario(nombre, apellido, mail, celular, pass, rol);
        u = usuarioRepo.guardar(u);
        System.out.println("Usuario creado con ID: " + u.getId());
    }

    private static void modificarUsuario() {
        listarUsuarios();
        Long id = leerLong("ID a modificar: ");
        Optional<Usuario> opt = usuarioRepo.buscarPorId(id);
        if (opt.isEmpty() || opt.get().isEliminado()) { System.out.println("ERROR: usuario inexistente o dado de baja."); return; }
        Usuario u = opt.get();

        System.out.println("Actual nombre: " + u.getNombre());
        String nn = leerString("Nuevo nombre (Enter conserva): ");
        if (!nn.isBlank()) u.setNombre(nn);

        System.out.println("Actual apellido: " + u.getApellido());
        String na = leerString("Nuevo apellido (Enter conserva): ");
        if (!na.isBlank()) u.setApellido(na);

        System.out.println("Actual mail: " + u.getMail());
        String nm = leerString("Nuevo mail (Enter conserva): ");
        if (!nm.isBlank() && !nm.equalsIgnoreCase(u.getMail())) {
            Optional<Usuario> otro = usuarioRepo.buscarPorMail(nm);
            if (otro.isPresent() && !otro.get().getId().equals(u.getId())) {
                System.out.println("ERROR: el mail ya está en uso."); return;
            }
            u.setMail(nm);
        }

        System.out.println("Actual celular: " + u.getCelular());
        String nc = leerString("Nuevo celular (Enter conserva): ");
        if (!nc.isBlank()) u.setCelular(nc);

        String np = leerString("Nueva contraseña (Enter conserva): ");
        if (!np.isBlank()) u.setContrasena(np);

        usuarioRepo.guardar(u);
        System.out.println("Usuario actualizado.");
    }

    private static void bajaUsuario() {
        Long id = leerLong("ID a dar de baja: ");
        Optional<Usuario> opt = usuarioRepo.buscarPorId(id);
        boolean ok = usuarioRepo.eliminarLogico(id);
        if (!ok) { System.out.println("ERROR: no encontrado o ya dado de baja."); return; }
        Usuario u = opt.get();
        System.out.println("Usuario dado de baja: " + u.getNombre() + " " + u.getApellido());
    }

    private static void listarUsuarios() {
        List<Usuario> lista = usuarioRepo.listarActivos();
        if (lista.isEmpty()) { System.out.println("(no hay usuarios activos)"); return; }
        System.out.println("\nID | Nombre completo | Mail | Rol");
        for (Usuario u : lista) {
            System.out.printf("%d | %s %s | %s | %s%n",
                    u.getId(), u.getNombre(), u.getApellido(), u.getMail(), u.getRol());
        }
    }

    private static void buscarUsuarioPorMail() {
        String mail = leerString("Mail a buscar: ");
        Optional<Usuario> opt = usuarioRepo.buscarPorMail(mail);
        if (opt.isEmpty()) { System.out.println("No existe usuario activo con ese mail."); return; }
        Usuario u = opt.get();
        System.out.printf("ID:%d | %s %s | %s | Cel:%s | Rol:%s%n",
                u.getId(), u.getNombre(), u.getApellido(), u.getMail(),
                u.getCelular(), u.getRol());
    }

    // ============================================================
    // 5.4 PEDIDOS
    // ============================================================
    private static void menuPedidos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- Pedidos ---");
            System.out.println("1. Alta de pedido");
            System.out.println("2. Cambiar estado");
            System.out.println("3. Baja lógica");
            System.out.println("4. Listado");
            System.out.println("5. Pedidos por usuario");
            System.out.println("6. Pedidos por estado");
            System.out.println("0. Volver");
            switch (leerInt("Opción: ")) {
                case 1 -> altaPedido();
                case 2 -> cambiarEstadoPedido();
                case 3 -> bajaPedido();
                case 4 -> listarPedidos();
                case 5 -> pedidosPorUsuario();
                case 6 -> pedidosPorEstado();
                case 0 -> volver = true;
                default -> System.out.println("Opción inválida.");
            }
        }
    }

    private static void altaPedido() {
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) { System.out.println("ERROR: no hay usuarios activos."); return; }
        listarUsuarios();
        Long idUsuario = leerLong("ID del usuario: ");
        Optional<Usuario> ou = usuarioRepo.buscarPorId(idUsuario);
        if (ou.isEmpty() || ou.get().isEliminado()) { System.out.println("ERROR: usuario inválido."); return; }

        FormaPago fp = leerFormaPago();

        // Lista temporal: solo IDs y cantidades (no entidades).
        List<long[]> temp = new ArrayList<>(); // [idProducto, cantidad]
        boolean agregar = true;
        while (agregar) {
            List<Producto> productos = productoRepo.listarActivos();
            if (productos.isEmpty()) { System.out.println("ERROR: no hay productos activos."); return; }
            System.out.println("\nCatálogo:");
            System.out.println("ID | Nombre | Precio | Stock");
            for (Producto p : productos) {
                System.out.printf("%d | %s | %.2f | %d%n",
                        p.getId(), p.getNombre(), p.getPrecio(), p.getStock());
            }
            Long idProd = leerLong("ID del producto a agregar: ");
            Optional<Producto> op = productoRepo.buscarPorId(idProd);
            if (op.isEmpty() || op.get().isEliminado()) {
                System.out.println("ERROR: producto inexistente o dado de baja.");
            } else if (!Boolean.TRUE.equals(op.get().getDisponible())) {
                System.out.println("ERROR: el producto no está disponible.");
            } else {
                int cantidad = leerInt("Cantidad: ");
                if (cantidad <= 0) {
                    System.out.println("ERROR: la cantidad debe ser mayor a 0.");
                } else {
                    // Stock proyectado considerando lo ya cargado en la lista temporal.
                    int yaCargado = 0;
                    for (long[] linea : temp) if (linea[0] == idProd) yaCargado += (int) linea[1];
                    if (op.get().getStock() < cantidad + yaCargado) {
                        System.out.println("ERROR: stock insuficiente. Disponible: "
                                + (op.get().getStock() - yaCargado));
                    } else {
                        temp.add(new long[]{idProd, cantidad});
                        System.out.println("Agregado.");
                    }
                }
            }
            String r = leerString("¿Agregar otro producto? (S/N): ");
            agregar = r.equalsIgnoreCase("S");
        }

        if (temp.isEmpty()) {
            System.out.println("ERROR: el pedido debe tener al menos un detalle. Cancelado.");
            return;
        }

        // Transacción única.
        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            Usuario usuarioGestionado = em.find(Usuario.class, idUsuario);

            Pedido pedido = new Pedido(LocalDate.now(), Estado.PENDIENTE, fp);

            for (long[] linea : temp) {
                Producto prod = em.find(Producto.class, linea[0]);
                int cantidad = (int) linea[1];
                if (prod == null || prod.isEliminado() || !Boolean.TRUE.equals(prod.getDisponible())) {
                    throw new RuntimeException("Producto " + linea[0] + " no disponible.");
                }
                if (prod.getStock() < cantidad) {
                    throw new RuntimeException("Stock insuficiente para " + prod.getNombre());
                }
                pedido.addDetallePedido(cantidad, prod);
                prod.setStock(prod.getStock() - cantidad); // se sincroniza al commit
            }

            pedido.calcularTotal();

            // Persistir pedido. Como Usuario tiene la colección owning con @JoinColumn(usuario_id),
            // asociamos el pedido al usuario para que JPA escriba la FK correctamente.
            usuarioGestionado.getPedidos().add(pedido);
            em.persist(pedido);

            tx.commit();

            System.out.println("\n=== PEDIDO CONFIRMADO ===");
            System.out.println("ID: " + pedido.getId());
            System.out.println("Fecha: " + pedido.getFecha());
            System.out.println("Usuario: " + usuarioGestionado.getNombre() + " " + usuarioGestionado.getApellido());
            System.out.println("Forma de pago: " + pedido.getFormaPago());
            System.out.println("Detalles:");
            for (DetallePedido d : pedido.getDetalles()) {
                System.out.printf("  - %s x%d = %.2f%n",
                        d.getProducto().getNombre(), d.getCantidad(), d.getSubtotal());
            }
            System.out.printf("TOTAL: %.2f%n", pedido.getTotal());

        } catch (RuntimeException e) {
            if (tx.isActive()) tx.rollback();
            System.out.println("ERROR en alta de pedido: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    private static void cambiarEstadoPedido() {
        Long id = leerLong("ID del pedido: ");
        Optional<Pedido> op = pedidoRepo.buscarPorId(id);
        if (op.isEmpty() || op.get().isEliminado()) { System.out.println("ERROR: pedido inválido."); return; }
        Pedido p = op.get();
        System.out.println("Estado actual: " + p.getEstado());
        Estado nuevo = leerEstado();
        p.setEstado(nuevo);
        pedidoRepo.guardar(p);
        System.out.println("Pedido " + p.getId() + " => " + p.getEstado());
    }

    private static void bajaPedido() {
        Long id = leerLong("ID a dar de baja: ");
        Optional<Pedido> op = pedidoRepo.buscarPorId(id);
        boolean ok = pedidoRepo.eliminarLogico(id);
        if (!ok) { System.out.println("ERROR: no encontrado o ya dado de baja."); return; }
        Pedido p = op.get();
        System.out.printf("Pedido %d dado de baja. Total: %.2f%n", p.getId(), p.getTotal());
    }

    private static void listarPedidos() {
        List<Pedido> lista = pedidoRepo.listarActivos();
        if (lista.isEmpty()) { System.out.println("(no hay pedidos activos)"); return; }
        System.out.println("\nID | Fecha | Estado | FormaPago | Usuario | Total");
        for (Pedido p : lista) {
            String usr = p.getUsuario() != null
                    ? p.getUsuario().getNombre() + " " + p.getUsuario().getApellido() : "-";
            System.out.printf("%d | %s | %s | %s | %s | %.2f%n",
                    p.getId(), p.getFecha(), p.getEstado(), p.getFormaPago(),
                    usr, p.getTotal() == null ? 0.0 : p.getTotal());
        }
    }

    private static void pedidosPorUsuario() {
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) { System.out.println("No hay usuarios activos."); return; }
        listarUsuarios();
        Long idU = leerLong("ID del usuario: ");
        List<Pedido> lista = pedidoRepo.buscarPorUsuario(idU);
        if (lista.isEmpty()) { System.out.println("(no hay pedidos para ese usuario)"); return; }
        System.out.println("ID | Fecha | Estado | Total");
        for (Pedido p : lista) {
            System.out.printf("%d | %s | %s | %.2f%n",
                    p.getId(), p.getFecha(), p.getEstado(), p.getTotal() == null ? 0.0 : p.getTotal());
        }
    }

    private static void pedidosPorEstado() {
        Estado e = leerEstado();
        List<Pedido> lista = pedidoRepo.buscarPorEstado(e);
        if (lista.isEmpty()) { System.out.println("(no hay pedidos en ese estado)"); return; }
        System.out.println("ID | Fecha | Usuario | Total");
        for (Pedido p : lista) {
            String usr = p.getUsuario() != null
                    ? p.getUsuario().getNombre() + " " + p.getUsuario().getApellido() : "-";
            System.out.printf("%d | %s | %s | %.2f%n",
                    p.getId(), p.getFecha(), usr, p.getTotal() == null ? 0.0 : p.getTotal());
        }
    }

    // ============================================================
    // 5.5 REPORTES
    // ============================================================
    private static void menuReportes() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- Reportes ---");
            System.out.println("1. Productos por categoría");
            System.out.println("2. Pedidos por usuario");
            System.out.println("3. Pedidos por estado");
            System.out.println("4. Total facturado");
            System.out.println("0. Volver");
            switch (leerInt("Opción: ")) {
                case 1 -> reporteProductosPorCategoria();
                case 2 -> pedidosPorUsuario();
                case 3 -> reportePedidosPorEstado();
                case 4 -> reporteTotalFacturado();
                case 0 -> volver = true;
                default -> System.out.println("Opción inválida.");
            }
        }
    }

    private static void reporteProductosPorCategoria() {
        List<Categoria> cats = categoriaRepo.listarActivos();
        if (cats.isEmpty()) { System.out.println("No hay categorías activas."); return; }
        listarCategorias();
        Long idC = leerLong("ID de la categoría: ");
        List<Producto> lista = productoRepo.buscarPorCategoria(idC);
        if (lista.isEmpty()) { System.out.println("(no hay productos activos en esa categoría)"); return; }
        System.out.println("ID | Nombre | Precio | Stock");
        for (Producto p : lista) {
            System.out.printf("%d | %s | %.2f | %d%n",
                    p.getId(), p.getNombre(), p.getPrecio(), p.getStock());
        }
    }

    private static void reportePedidosPorEstado() {
        Estado e = leerEstado();
        List<Pedido> lista = pedidoRepo.buscarPorEstado(e);
        if (lista.isEmpty()) { System.out.println("(no hay pedidos en ese estado)"); return; }
        System.out.println("ID | Fecha | Usuario | Total");
        for (Pedido p : lista) {
            String usr = p.getUsuario() != null
                    ? p.getUsuario().getNombre() + " " + p.getUsuario().getApellido() : "-";
            System.out.printf("%d | %s | %s | %.2f%n",
                    p.getId(), p.getFecha(), usr, p.getTotal() == null ? 0.0 : p.getTotal());
        }
    }

    private static void reporteTotalFacturado() {
        List<Pedido> terminados = pedidoRepo.buscarPorEstado(Estado.TERMINADO);
        double total = terminados.stream()
                .mapToDouble(p -> p.getTotal() == null ? 0.0 : p.getTotal())
                .sum();
        System.out.println("Total facturado: " + String.format(Locale.US, "$%.2f", total));
    }

    // ============================================================
    // HELPERS de lectura
    // ============================================================
    private static String leerString(String prompt) {
        System.out.print(prompt);
        return SC.nextLine().trim();
    }

    private static int leerInt(String prompt) {
        while (true) {
            System.out.print(prompt);
            String s = SC.nextLine().trim();
            try { return Integer.parseInt(s); }
            catch (NumberFormatException e) { System.out.println("Ingrese un número entero válido."); }
        }
    }

    private static long leerLong0(String prompt) {
        while (true) {
            System.out.print(prompt);
            String s = SC.nextLine().trim();
            try { return Long.parseLong(s); }
            catch (NumberFormatException e) { System.out.println("Ingrese un número entero válido."); }
        }
    }

    private static Long leerLong(String prompt) { return leerLong0(prompt); }

    private static double leerDouble(String prompt) {
        while (true) {
            System.out.print(prompt);
            String s = SC.nextLine().trim().replace(",", ".");
            try { return Double.parseDouble(s); }
            catch (NumberFormatException e) { System.out.println("Ingrese un número válido."); }
        }
    }

    private static Rol leerRol() {
        while (true) {
            System.out.print("Rol (1=ADMIN, 2=USUARIO): ");
            String s = SC.nextLine().trim();
            if (s.equals("1")) return Rol.ADMIN;
            if (s.equals("2")) return Rol.USUARIO;
            System.out.println("Opción inválida.");
        }
    }

    private static Estado leerEstado() {
        while (true) {
            System.out.println("Estado: 1=PENDIENTE, 2=CONFIRMADO, 3=TERMINADO, 4=CANCELADO");
            System.out.print("Opción: ");
            String s = SC.nextLine().trim();
            switch (s) {
                case "1": return Estado.PENDIENTE;
                case "2": return Estado.CONFIRMADO;
                case "3": return Estado.TERMINADO;
                case "4": return Estado.CANCELADO;
                default: System.out.println("Opción inválida.");
            }
        }
    }

    private static FormaPago leerFormaPago() {
        while (true) {
            System.out.println("Forma de pago: 1=TARJETA, 2=TRANSFERENCIA, 3=EFECTIVO");
            System.out.print("Opción: ");
            String s = SC.nextLine().trim();
            switch (s) {
                case "1": return FormaPago.TARJETA;
                case "2": return FormaPago.TRANSFERENCIA;
                case "3": return FormaPago.EFECTIVO;
                default: System.out.println("Opción inválida.");
            }
        }
    }
}
