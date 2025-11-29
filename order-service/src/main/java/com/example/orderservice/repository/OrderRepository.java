package com.example.orderservice.repository;

import com.example.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // ✅ Основные методы
    List<Order> findByUserId(Long userId);
    List<Order> findByRestaurantId(Long restaurantId);
    List<Order> findByStatus(Order.OrderStatus status);

    // ✅ ДОБАВЛЕНО: Поиск заказов пользователя по статусу
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.status = :status")
    List<Order> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Order.OrderStatus status);

    // ✅ ДОБАВЛЕНО: Поиск заказов ресторана по статусу
    @Query("SELECT o FROM Order o WHERE o.restaurantId = :restaurantId AND o.status = :status")
    List<Order> findByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") Order.OrderStatus status);

    // ✅ ДОБАВЛЕНО: Поиск заказов за период
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findByOrderDateBetween(@Param("startDate") java.time.LocalDateTime startDate,
                                       @Param("endDate") java.time.LocalDateTime endDate);

    // ✅ ДОБАВЛЕНО: Поиск заказов пользователя за период
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findByUserIdAndOrderDateBetween(@Param("userId") Long userId,
                                                @Param("startDate") java.time.LocalDateTime startDate,
                                                @Param("endDate") java.time.LocalDateTime endDate);
}