package com.example.userservice.controller;

import com.example.userservice.model.User;
import com.example.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(@RequestHeader("X-User-Id") Long userId) {
        User user = userService.findById(userId);
        // Очищаем пароль для безопасности
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('MANAGER') and #id == authentication.principal.id)")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        // Очищаем пароль для безопасности
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    // Назначение роли - ТОЛЬКО для админа
    @PostMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignRoleToUser(
            @PathVariable Long userId,
            @PathVariable String roleName,
            @RequestHeader("X-User-Id") Long adminId) {

        log.info("Admin (ID: {}) assigning role '{}' to user (ID: {})",
                adminId, roleName, userId);

        try {
            // Дополнительная проверка: убедимся, что запрос от админа
            if (!userService.isAdmin(adminId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "error", "Access denied",
                        "message", "Only administrators can assign roles"
                ));
            }

            User updatedUser = userService.assignRoleToUser(userId, roleName);
            updatedUser.setPasswordHash(null);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Role assigned successfully",
                    "user", updatedUser
            ));
        } catch (Exception e) {
            log.error("Error assigning role: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to assign role",
                    "message", e.getMessage()
            ));
        }
    }

    // Удаление роли - ТОЛЬКО для админа
    @DeleteMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable String roleName,
            @RequestHeader("X-User-Id") Long adminId) {

        log.info("Admin (ID: {}) removing role '{}' from user (ID: {})",
                adminId, roleName, userId);

        try {
            // Дополнительная проверка: убедимся, что запрос от админа
            if (!userService.isAdmin(adminId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "error", "Access denied",
                        "message", "Only administrators can remove roles"
                ));
            }

            User updatedUser = userService.removeRoleFromUser(userId, roleName);
            updatedUser.setPasswordHash(null);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Role removed successfully",
                    "user", updatedUser
            ));
        } catch (Exception e) {
            log.error("Error removing role: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to remove role",
                    "message", e.getMessage()
            ));
        }
    }

    // Получение всех ролей пользователя - ТОЛЬКО для админа
    @GetMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserRoles(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long adminId) {

        // Проверка, что запрос от админа
        if (!userService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "Access denied",
                    "message", "Only administrators can view user roles"
            ));
        }

        User user = userService.findById(userId);
        user.setPasswordHash(null);

        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "roles", user.getRoles()
        ));
    }

    // Получить всех пользователей - только для администраторов
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(@RequestHeader("X-User-Id") Long adminId) {
        try {
            // Проверка, что запрос от админа
            if (!userService.isAdmin(adminId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "error", "Access denied",
                        "message", "Only administrators can view all users"
                ));
            }

            // Здесь должен быть метод для получения всех пользователей
            // return ResponseEntity.ok(userService.getAllUsers());
            return ResponseEntity.ok(Map.of(
                    "message", "Get all users endpoint - to be implemented"
            ));
        } catch (Exception e) {
            log.error("Error getting all users: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to get users",
                    "message", e.getMessage()
            ));
        }
    }
}