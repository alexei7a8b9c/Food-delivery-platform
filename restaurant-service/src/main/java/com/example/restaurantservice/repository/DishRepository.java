package com.example.restaurantservice.repository;

import com.example.restaurantservice.model.Dish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {

    @Query("SELECT d FROM Dish d WHERE d.deleted = false AND d.restaurant.id = :restaurantId")
    List<Dish> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT d FROM Dish d WHERE d.deleted = false AND d.restaurant.id = :restaurantId")
    Page<Dish> findByRestaurantId(@Param("restaurantId") Long restaurantId, Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE d.deleted = false")
    Page<Dish> findAll(Pageable pageable);

    @Query("SELECT d FROM Dish d WHERE d.deleted = false AND d.restaurant.id = :restaurantId AND d.id IN :dishIds")
    List<Dish> findByRestaurantIdAndIdIn(@Param("restaurantId") Long restaurantId, @Param("dishIds") List<Long> dishIds);
}