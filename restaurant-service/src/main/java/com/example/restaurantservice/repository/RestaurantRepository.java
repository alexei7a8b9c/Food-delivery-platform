package com.example.restaurantservice.repository;

import com.example.restaurantservice.model.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    List<Restaurant> findByCuisine(String cuisine);

    @Query("SELECT r FROM Restaurant r WHERE r.deleted = false")
    Page<Restaurant> findAll(Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE r.deleted = false AND r.id = :id")
    Optional<Restaurant> findById(@Param("id") Long id);

    @Query("SELECT r FROM Restaurant r WHERE r.deleted = false AND " +
            "(LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Restaurant> searchByNameOrCuisine(@Param("query") String query);

    @Query("SELECT COUNT(r) > 0 FROM Restaurant r WHERE r.deleted = false AND r.id = :id")
    boolean existsById(@Param("id") Long id);

    @Query("SELECT r FROM Restaurant r WHERE r.deleted = false AND r.name = :name")
    Optional<Restaurant> findByName(@Param("name") String name);

    @Query("SELECT r FROM Restaurant r WHERE r.deleted = false AND r.email = :email")
    Optional<Restaurant> findByEmail(@Param("email") String email);
}