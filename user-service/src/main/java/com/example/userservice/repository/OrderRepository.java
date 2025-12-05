package com.example.userservice.repository;

import com.example.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // ✅ Основные методы с @Param

    @Query("SELECT o FROM Order o WHERE o.userId = :userId")
    List<Order> findByUserId(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o WHERE o.restaurantId = :restaurantId")
    List<Order> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT o FROM Order o WHERE o.status = :status")
    List<Order> findByStatus(@Param("status") Order.OrderStatus status);

    // ✅ ДОБАВЛЕНО: Поиск заказов пользователя по статусу

    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.status = :status")
    List<Order> findByUserIdAndStatus(@Param("userId") Long userId,
                                      @Param("status") Order.OrderStatus status);

    // ✅ ДОБАВЛЕНО: Поиск заказов ресторана по статусу

    @Query("SELECT o FROM Order o WHERE o.restaurantId = :restaurantId AND o.status = :status")
    List<Order> findByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId,
                                            @Param("status") Order.OrderStatus status);

    // ✅ ДОБАВЛЕНО: Поиск заказов за период

    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findByOrderDateBetween(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    // ✅ ДОБАВЛЕНО: Поиск заказов пользователя за период

    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findByUserIdAndOrderDateBetween(@Param("userId") Long userId,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    // ✅ ДОБАВЛЕНО: Получить заказы с общей стоимостью больше указанной

    @Query("SELECT o FROM Order o WHERE o.totalPrice > :minPrice")
    List<Order> findByTotalPriceGreaterThan(@Param("minPrice") Integer minPrice);

    // ✅ ДОБАВЛЕНО: Получить заказы с общей стоимостью меньше указанной

    @Query("SELECT o FROM Order o WHERE o.totalPrice < :maxPrice")
    List<Order> findByTotalPriceLessThan(@Param("maxPrice") Integer maxPrice);

    // ✅ ДОБАВЛЕНО: Получить заказы по диапазону стоимости

    @Query("SELECT o FROM Order o WHERE o.totalPrice BETWEEN :minPrice AND :maxPrice")
    List<Order> findByTotalPriceBetween(@Param("minPrice") Integer minPrice,
                                        @Param("maxPrice") Integer maxPrice);

    // ✅ ДОБАВЛЕНО: Посчитать общее количество заказов пользователя

    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);

    // ✅ ДОБАВЛЕНО: Посчитать общую сумму заказов пользователя

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.userId = :userId")
    Integer sumTotalPriceByUserId(@Param("userId") Long userId);

    // ✅ ДОБАВЛЕНО: Получить последние N заказов пользователя

    @Query("SELECT o FROM Order o WHERE o.userId = :userId ORDER BY o.orderDate DESC")
    List<Order> findTopNByUserIdOrderByOrderDateDesc(@Param("userId") Long userId);

    // ✅ ДОБАВЛЕНО: Получить заказы по списку статусов

    @Query("SELECT o FROM Order o WHERE o.status IN :statuses")
    List<Order> findByStatusIn(@Param("statuses") List<Order.OrderStatus> statuses);

    // ✅ ДОБАВЛЕНО: Поиск по нескольким ресторанам

    @Query("SELECT o FROM Order o WHERE o.restaurantId IN :restaurantIds")
    List<Order> findByRestaurantIdIn(@Param("restaurantIds") List<Long> restaurantIds);

    // ✅ ДОБАВЛЕНО: Проверка существования активного заказа у пользователя

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o WHERE o.userId = :userId AND o.status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY')")
    boolean existsActiveOrderByUserId(@Param("userId") Long userId);
}