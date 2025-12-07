package com.example.restaurantservice.repository;

import com.example.restaurantservice.model.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByRestaurantId(Long restaurantId);
    List<Dish> findByRestaurantIdAndIdIn(Long restaurantId, List<Long> dishIds);
}