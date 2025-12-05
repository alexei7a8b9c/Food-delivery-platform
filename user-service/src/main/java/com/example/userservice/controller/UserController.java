package com.example.userservice.controller;

import com.example.userservice.model.User;
import com.example.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        // Очищаем пароль для безопасности
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    // Назначение роли (только для админа)
    @PostMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignRoleToUser(
            @PathVariable Long userId,
            @PathVariable String roleName,
            @RequestHeader("X-User-Id") Long adminId) {

        log.info("Admin (ID: {}) assigning role '{}' to user (ID: {})",
                adminId, roleName, userId);

        try {
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

    // Удаление роли (только для админа)
    @DeleteMapping("/{userId}/roles/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable String roleName,
            @RequestHeader("X-User-Id") Long adminId) {

        log.info("Admin (ID: {}) removing role '{}' from user (ID: {})",
                adminId, roleName, userId);

        try {
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

    // Получение всех ролей пользователя
    @GetMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserRoles(@PathVariable Long userId) {
        User user = userService.findById(userId);
        user.setPasswordHash(null);

        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "roles", user.getRoles()
        ));
    }
}