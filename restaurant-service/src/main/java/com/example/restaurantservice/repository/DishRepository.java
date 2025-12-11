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

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {

    Page<Dish> findByRestaurantIdAndDeletedFalse(Long restaurantId, Pageable pageable);

    Page<Dish> findByPriceBetweenAndDeletedFalse(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE " +
            "(LOWER(d.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "d.deleted = false")
    Page<Dish> search(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE " +
            "d.restaurant.id = :restaurantId AND " +
            "(:name IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
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

    Page<Dish> findByRestaurantIdInAndDeletedFalse(List<Long> restaurantIds, Pageable pageable);

    boolean existsByNameAndRestaurantIdAndDeletedFalse(String name, Long restaurantId);

    List<Dish> findByDeletedTrue();

    @Query("SELECT MIN(d.price), MAX(d.price), AVG(d.price) FROM Dish d WHERE d.deleted = false")
    Object[] getPriceStatistics();

    Page<Dish> findByDeletedFalse(Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE d.deleted = false")
    Page<Dish> findAllActive(Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE d.restaurant.id = :restaurantId")
    Page<Dish> findByRestaurantId(@Param("restaurantId") Long restaurantId, Pageable pageable);

    List<Dish> findByRestaurantIdAndDeletedFalse(Long restaurantId);
}