package com.example.restaurantservice.repository;

import com.example.restaurantservice.entity.Dish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {

    // Существующие методы
    Page<Dish> findByRestaurantIdAndDeletedFalse(Long restaurantId, Pageable pageable);

    Page<Dish> findByPriceBetweenAndDeletedFalse(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE " +
            "(:searchTerm IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "d.deleted = false")
    Page<Dish> search(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE " +
            "d.restaurant.id = :restaurantId AND " +
            "(:name IS NULL OR :name = '' OR d.name LIKE CONCAT('%', :name, '%')) AND " +
            "(:minPrice IS NULL OR d.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR d.price <= :maxPrice) AND " +
            "d.deleted = false")
    Page<Dish> findByRestaurantIdAndFilters(
            @Param("restaurantId") Long restaurantId,
            @Param("name") String name,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    boolean existsByNameAndRestaurantIdAndDeletedFalse(String name, Long restaurantId);

    List<Dish> findByDeletedTrue();

    @Query("SELECT MIN(d.price), MAX(d.price), AVG(d.price) FROM Dish d WHERE d.deleted = false")
    Object[] getPriceStatistics();

    Page<Dish> findByDeletedFalse(Pageable pageable);

    // Упрощенный метод для получения блюд ресторана
    @Query("SELECT d FROM Dish d WHERE d.restaurant.id = :restaurantId AND d.deleted = false")
    Page<Dish> findByRestaurantId(@Param("restaurantId") Long restaurantId, Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE d.restaurant.id = :restaurantId AND d.deleted = false")
    List<Dish> findAllByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(d) FROM Dish d WHERE d.restaurant.id = :restaurantId AND d.deleted = false")
    Long countByRestaurantId(@Param("restaurantId") Long restaurantId);

    // Новый метод для поиска по ID и проверки удаления
    @Query("SELECT d FROM Dish d WHERE d.id = :id AND d.deleted = false")
    Optional<Dish> findActiveById(@Param("id") Long id);
}