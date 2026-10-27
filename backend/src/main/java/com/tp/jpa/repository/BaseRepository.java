package com.tp.jpa.repository;

import com.tp.jpa.model.Base;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio genérico con CRUD común para todas las entidades que extiendan Base.
 * Cada método abre su propio EntityManager y lo cierra en un bloque finally.
 */
public abstract class BaseRepository<T extends Base> {

    protected final EntityManagerFactory emf;
    private final Class<T> entityClass;

    protected BaseRepository(Class<T> entityClass) {
        this.entityClass = entityClass;
        this.emf = JPAUtil.getEntityManagerFactory();
    }

    protected Class<T> getEntityClass() {
        return entityClass;
    }

    /**
     * Persiste la entidad: persist() si el id es null (alta), merge() si ya tiene id.
     * Maneja la transacción con commit/rollback. Retorna la entidad gestionada.
     */
    public T guardar(T entity) {
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            T managed;
            if (entity.getId() == null) {
                em.persist(entity);
                managed = entity; // con persist() la misma instancia recibe el ID
            } else {
                managed = em.merge(entity);
            }
            tx.commit();
            return managed;
        } catch (RuntimeException e) {
            if (tx.isActive()) tx.rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public Optional<T> buscarPorId(Long id) {
        EntityManager em = emf.createEntityManager();
        try {
            T found = em.find(entityClass, id);
            return Optional.ofNullable(found);
        } finally {
            em.close();
        }
    }

    /**
     * Retorna todas las entidades activas (eliminado = false).
     * Usa el nombre simple de la clase para construir la JPQL.
     */
    public List<T> listarActivos() {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT e FROM " + entityClass.getSimpleName()
                    + " e WHERE e.eliminado = false";
            return em.createQuery(jpql, entityClass).getResultList();
        } finally {
            em.close();
        }
    }

    /**
     * Baja lógica: marca eliminado = true. Retorna true si se realizó, false si no existe.
     */
    public boolean eliminarLogico(Long id) {
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            T entity = em.find(entityClass, id);
            if (entity == null || entity.isEliminado()) {
                return false;
            }
            tx.begin();
            entity.setEliminado(true);
            em.merge(entity);
            tx.commit();
            return true;
        } catch (RuntimeException e) {
            if (tx.isActive()) tx.rollback();
            throw e;
        } finally {
            em.close();
        }
    }
}
