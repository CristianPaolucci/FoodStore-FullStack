# Food Store — Backend JPA + Hibernate + H2 (Menú de Consola)

Proyecto Gradle/Java 17 que implementa el backend de consola del TP Final de Programación III.

## Cómo abrirlo en IntelliJ IDEA

1. Copiar la carpeta `backend-java/` a tu máquina (puede ir donde quieras).
2. En IntelliJ: **File → Open…** y seleccionar la carpeta `backend-java`.
3. IntelliJ detecta `build.gradle` y descarga las dependencias (Hibernate, H2, JPA API).
4. Esperar a que termine la indexación.

## Cómo ejecutarlo

- Desde IntelliJ: click derecho sobre `src/main/java/com/tp/jpa/Main.java` → **Run 'Main.main()'**.
- Desde terminal:
  ```bash
  ./gradlew run         # Linux/Mac
  gradlew.bat run       # Windows
  ```

La base de datos H2 se crea automáticamente en `./data/jpa_db.mv.db` la primera vez que ejecutás la app.

## Estructura

```
backend-java/
├── build.gradle
├── settings.gradle
└── src/main/
    ├── java/com/tp/jpa/
    │   ├── Main.java
    │   ├── model/
    │   │   ├── Base.java
    │   │   ├── Calculable.java
    │   │   ├── Categoria.java
    │   │   ├── Producto.java
    │   │   ├── Usuario.java
    │   │   ├── Pedido.java
    │   │   ├── DetallePedido.java
    │   │   └── enums/{Rol,Estado,FormaPago}.java
    │   ├── repository/
    │   │   ├── BaseRepository.java
    │   │   ├── CategoriaRepository.java
    │   │   ├── ProductoRepository.java
    │   │   ├── UsuarioRepository.java
    │   │   └── PedidoRepository.java
    │   └── util/JPAUtil.java
    └── resources/META-INF/persistence.xml
```

## Notas técnicas

- **Soft delete**: las bajas son lógicas (`eliminado = true`). Los registros no se borran de la BD.
- **Transacción única en alta de pedido**: si cualquier validación falla, rollback completo.
- **JPQL personalizado**: `ProductoRepository.buscarPorCategoria`, `UsuarioRepository.buscarPorMail`, `PedidoRepository.buscarPorUsuario` y `buscarPorEstado`, cada uno con su comentario.
- **Relación Usuario–Pedido**: el "owning side" es `Usuario` (con `@JoinColumn(name="usuario_id")` sobre la colección de pedidos), tal como pide la consigna. En `Pedido` se agrega un mapeo `@ManyToOne` de solo lectura sobre la misma FK para poder usar `p.usuario.id` en JPQL.
- El alta de pedido agrega el `Pedido` al `Set<Pedido>` del `Usuario` gestionado para que JPA setee correctamente la FK `usuario_id` al hacer commit.

Link al video:
https://drive.google.com/file/d/1drKym0XdZ_0qISIItYykdq8tQTH6Gbof/view?usp=drive_link
