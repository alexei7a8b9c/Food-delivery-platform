    package com.example.restaurantservice.repository;

    import com.example.restaurantservice.entity.Restaurant;
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

        Page<Restaurant> findByDeletedFalse(Pageable pageable);

        Page<Restaurant> findByCuisineAndDeletedFalse(String cuisine, Pageable pageable);

        @Query("SELECT r FROM Restaurant r WHERE " +
                "(LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                "LOWER(r.address) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
                "r.deleted = false")
        Page<Restaurant> search(@Param("searchTerm") String searchTerm, Pageable pageable);

        @Query("SELECT r FROM Restaurant r WHERE " +
                "(LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                "LOWER(r.address) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                "LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
                "r.deleted = false")
        Page<Restaurant> searchAllFields(@Param("searchTerm") String searchTerm, Pageable pageable);

        boolean existsByNameAndDeletedFalse(String name);

        boolean existsByIdAndDeletedFalse(Long id);

        List<Restaurant> findByDeletedTrue();

        @Query("SELECT r FROM Restaurant r WHERE " +
                "(:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
                "(:cuisine IS NULL OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :cuisine, '%'))) AND " +
                "(:address IS NULL OR LOWER(r.address) LIKE LOWER(CONCAT('%', :address, '%'))) AND " +
                "r.deleted = false")
        Page<Restaurant> findByFilters(
                @Param("name") String name,
                @Param("cuisine") String cuisine,
                @Param("address") String address,
                Pageable pageable
        );

        @Query("SELECT r FROM Restaurant r WHERE r.id = :id AND r.deleted = false")
        Optional<Restaurant> findActiveById(@Param("id") Long id);
    }