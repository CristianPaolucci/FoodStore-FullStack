package com.tp.jpa.model;

import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.FormaPago;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido extends Base implements Calculable {

    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    private Double total;

    @Enumerated(EnumType.STRING)
    private FormaPago formaPago;

    // Composición bidireccional con DetallePedido.
    // mappedBy debe coincidir con el campo "pedido" de DetallePedido.
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedido> detalles = new ArrayList<>();

    // Mapeo de solo lectura sobre la FK usuario_id (gestionada por Usuario).
    // Permite que las JPQL referencien p.usuario.id sin duplicar la relación.
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "usuario_id", insertable = false, updatable = false)
    private Usuario usuario;

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }


    public Pedido() {}

    public Pedido(LocalDate fecha, Estado estado, FormaPago formaPago) {
        this.fecha = fecha;
        this.estado = estado;
        this.formaPago = formaPago;
    }

    /**
     * Único punto de creación de DetallePedido en el sistema.
     * Calcula el subtotal internamente como producto.getPrecio() * cantidad,
     * establece la referencia bidireccional y lo agrega a la colección.
     */
    public void addDetallePedido(int cantidad, Producto producto) {
        DetallePedido detalle = new DetallePedido();
        detalle.setCantidad(cantidad);
        detalle.setProducto(producto);
        detalle.setSubtotal(producto.getPrecio() * cantidad);
        detalle.setPedido(this);
        this.detalles.add(detalle);
    }

    /**
     * Busca un DetallePedido dentro del pedido por el Producto asociado.
     * Devuelve null si no existe.
     */
    public DetallePedido findDetallePedidoByProducto(Producto producto) {
        if (producto == null) return null;
        for (DetallePedido d : detalles) {
            if (d.getProducto() != null
                    && d.getProducto().getId() != null
                    && d.getProducto().getId().equals(producto.getId())) {
                return d;
            }
        }
        return null;
    }

    /**
     * Elimina del pedido el DetallePedido asociado al Producto indicado.
     */
    public void deleteDetallePedidoByProducto(Producto producto) {
        DetallePedido d = findDetallePedidoByProducto(producto);
        if (d != null) {
            d.setPedido(null);
            this.detalles.remove(d);
        }
    }


    /**
     * Suma los subtotales de todos los detalles y asigna el resultado a total.
     */
    @Override
    public void calcularTotal() {
        double suma = 0.0;
        for (DetallePedido d : detalles) {
            if (d.getSubtotal() != null) {
                suma += d.getSubtotal();
            }
        }
        this.total = suma;
    }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public FormaPago getFormaPago() { return formaPago; }
    public void setFormaPago(FormaPago formaPago) { this.formaPago = formaPago; }

    public List<DetallePedido> getDetalles() { return detalles; }
    public void setDetalles(List<DetallePedido> detalles) { this.detalles = detalles; }
}
