package com.example.userservice.controller;

import com.example.userservice.dto.*;
import com.example.userservice.model.RefreshToken;
import com.example.userservice.model.User;
import com.example.userservice.service.JwtService;
import com.example.userservice.service.TokenService;
import com.example.userservice.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    // 1. Регистрация пользователя
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            log.info("Registering user with email: {}", request.getEmail());

            // Проверка сложности пароля (можно добавить больше проверок)
            if (request.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters long");
            }

            User user = userService.registerUser(request);
            TokenPair tokenPair = tokenService.generateTokenPair(user);

            AuthResponse response = buildAuthResponse(tokenPair, user);
            log.info("User registered successfully: {}", user.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Вход в систему
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {
        try {
            log.info("Login attempt for email: {} from IP: {}",
                    request.getEmail(),
                    httpRequest.getRemoteAddr());

            User user = userService.findByEmail(request.getEmail());

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                log.warn("Invalid password for email: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid credentials");
            }

            TokenPair tokenPair = tokenService.generateTokenPair(user);
            AuthResponse response = buildAuthResponse(tokenPair, user);

            log.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }
    }

    // 3. Обновление токена
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            log.info("Refresh token request");

            RefreshToken refreshToken = tokenService.validateRefreshToken(request.getRefreshToken());
            User user = userService.findById(refreshToken.getUserId());

            // Ротация refresh токенов - удаляем старый
            tokenService.deleteRefreshToken(request.getRefreshToken());

            // Генерируем новую пару токенов
            TokenPair newTokenPair = tokenService.generateTokenPair(user);
            AuthResponse response = buildAuthResponse(newTokenPair, user);

            log.info("Token refreshed successfully for user: {}", user.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Refresh token failed: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid refresh token");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse);
        }
    }

    // 4. Выход из системы
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody LogoutRequest request,
                                    @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            log.info("Logout request from user ID: {}", userId);

            tokenService.deleteRefreshToken(request.getRefreshToken());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Logged out successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Logout failed");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // 5. Выход из всех устройств
    @PostMapping("/logout-all")
    public ResponseEntity<?> logoutAll(@RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("Logout all sessions for user: {}", userId);

            tokenService.deleteAllUserTokens(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "All sessions logged out successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Logout all failed: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Logout failed");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // 6. Валидация токена
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            log.info("Validating token");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid token format");
            }

            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token");
            }

            String username = jwtService.extractUsername(token);
            Long userId = jwtService.extractUserId(token);
            User user = userService.findByEmail(username);

            AuthResponse response = AuthResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtService.getExpirationSeconds())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .userId(user.getId())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Token validation failed", e);

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Token validation failed");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse);
        }
    }

    // 7. Смена пароля
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            log.info("Changing password for user ID: {}", userId);

            User user = userService.findById(userId);

            // Проверяем текущий пароль
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Current password is incorrect");
            }

            // Проверяем новый пароль
            if (request.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest()
                        .body("New password must be at least 6 characters long");
            }

            // Обновляем пароль
            userService.updatePassword(userId, request.getNewPassword());

            // Удаляем все refresh токены пользователя
            tokenService.deleteAllUserTokens(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully. Please login again.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Password change failed for user ID: {}", userId, e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 8. Запрос на сброс пароля
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            log.info("Forgot password request for email: {}", email);

            // В реальном приложении здесь будет:
            // 1. Проверка существования пользователя
            // 2. Генерация токена сброса пароля
            // 3. Отправка email с ссылкой для сброса

            if (!userService.existsByEmail(email)) {
                // Для безопасности не сообщаем, что email не существует
                log.warn("Forgot password request for non-existent email: {}", email);
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "If the email exists, password reset instructions will be sent");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Forgot password request failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Request failed");
        }
    }

    // 9. Сброс пароля
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            log.info("Reset password request");

            // В реальном приложении здесь будет:
            // 1. Валидация токена сброса пароля
            // 2. Обновление пароля

            // Временно просто возвращаем успех
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Reset password failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Password reset failed");
        }
    }

    // 10. Проверка доступности email
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        try {
            log.info("Checking email availability: {}", email);

            boolean exists = userService.existsByEmail(email);

            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
            response.put("available", !exists);
            response.put("message", exists ? "Email already taken" : "Email available");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Email check failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Check failed");
        }
    }

    // 11. Получение информации о текущем пользователе
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("Getting current user info for ID: {}", userId);

            User user = userService.findById(userId);

            // Не возвращаем хэш пароля
            user.setPasswordHash(null);

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("roles", userService.getUserRoles(userId));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get user info: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }
    }

    // 12. Обновление профиля
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            log.info("Updating profile for user ID: {}", userId);

            User updatedUser = userService.updateProfile(
                    userId,
                    request.getFullName(),
                    request.getTelephone()
            );

            // Не возвращаем хэш пароля
            updatedUser.setPasswordHash(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Profile update failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 13. Проверка состояния системы
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "user-service-auth");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }

    // 14. Получение версии API
    @GetMapping("/version")
    public ResponseEntity<?> getVersion() {
        Map<String, String> version = new HashMap<>();
        version.put("version", "1.0.0");
        version.put("api", "auth");
        return ResponseEntity.ok(version);
    }

    // Вспомогательный метод для создания ответа
    private AuthResponse buildAuthResponse(TokenPair tokenPair, User user) {
        return AuthResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .refreshToken(tokenPair.getRefreshToken())
                .tokenType(tokenPair.getTokenType())
                .expiresIn(tokenPair.getExpiresIn())
                .refreshTokenExpiresIn(tokenPair.getRefreshTokenExpiresIn())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .userId(user.getId())
                .build();
    }
}

// DTO классы

@Data
class ChangePasswordRequest {
    @NotBlank
    private String currentPassword;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}

@Data
class ResetPasswordRequest {
    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}

@Data
class UpdateProfileRequest {
    @NotBlank
    private String fullName;

    private String telephone;
}