package com.example.userservice.controller;

import com.example.userservice.dto.*;
import com.example.userservice.model.RefreshToken;
import com.example.userservice.model.User;
import com.example.userservice.service.JwtService;
import com.example.userservice.service.TokenService;
import com.example.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
@Tag(name = "Authentication", description = "API для регистрации и аутентификации пользователей")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @Operation(summary = "Регистрация нового пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Пользователь успешно зарегистрирован"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса"),
            @ApiResponse(responseCode = "409", description = "Пользователь с таким email уже существует")
    })
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            log.info("Registering user with email: {}", request.getEmail());

            if (request.getPassword().length() < 6) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Validation failed");
                error.put("message", "Password must be at least 6 characters long");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userService.registerUser(request);
            TokenPair tokenPair = tokenService.generateTokenPair(user);

            AuthResponse response = buildAuthResponse(tokenPair, user);
            log.info("User registered successfully: {}", user.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);

            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed");
            error.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);

        } catch (Exception e) {
            log.error("Unexpected error during registration: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", "An unexpected error occurred");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Аутентификация пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешная аутентификация"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса"),
            @ApiResponse(responseCode = "401", description = "Неверные учетные данные")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {
        try {
            log.info("Login attempt for email: {} from IP: {}",
                    request.getEmail(),
                    httpRequest.getRemoteAddr());

            User user = userService.findByEmail(request.getEmail());

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                log.warn("Invalid password for email: {}", request.getEmail());

                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication failed");
                error.put("message", "Invalid credentials");

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            TokenPair tokenPair = tokenService.generateTokenPair(user);
            AuthResponse response = buildAuthResponse(tokenPair, user);

            log.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Login failed for email: {}", request.getEmail(), e);

            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed");
            error.put("message", "Invalid credentials");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);

        } catch (Exception e) {
            log.error("Unexpected error during login: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", "An unexpected error occurred");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Обновление access token с помощью refresh token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Токен успешно обновлен"),
            @ApiResponse(responseCode = "401", description = "Недействительный или просроченный refresh token")
    })
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            log.info("Refresh token request");

            RefreshToken refreshToken = tokenService.validateRefreshToken(request.getRefreshToken());
            User user = userService.findById(refreshToken.getUserId());

            tokenService.deleteRefreshToken(request.getRefreshToken());
            TokenPair newTokenPair = tokenService.generateTokenPair(user);

            AuthResponse response = buildAuthResponse(newTokenPair, user);
            log.info("Token refreshed successfully for user: {}", user.getEmail());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Refresh token failed: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Token refresh failed");
            error.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);

        } catch (Exception e) {
            log.error("Unexpected error during token refresh: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", "An unexpected error occurred");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Выход из системы")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешный выход из системы"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса")
    })
    public ResponseEntity<?> logout(@Valid @RequestBody LogoutRequest request) {
        try {
            log.info("Logout request");

            tokenService.deleteRefreshToken(request.getRefreshToken());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Logged out successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Logout failed");
            error.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Выход из всех устройств")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешный выход из всех устройств"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса")
    })
    public ResponseEntity<?> logoutAll(@RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("Logout all sessions for user ID: {}", userId);

            tokenService.deleteAllUserTokens(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "All sessions logged out successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Logout all failed: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Logout failed");
            error.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/validate")
    @Operation(summary = "Валидация access token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Токен действителен"),
            @ApiResponse(responseCode = "401", description = "Токен недействителен или просрочен")
    })
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            log.info("Validating token");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid token format");
                error.put("message", "Authorization header must start with 'Bearer '");
                return ResponseEntity.badRequest().body(error);
            }

            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid token");
                error.put("message", "Token is invalid or expired");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
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

            Map<String, String> error = new HashMap<>();
            error.put("error", "Token validation failed");
            error.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/change-password")
    @Operation(summary = "Смена пароля")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Пароль успешно изменен"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса"),
            @ApiResponse(responseCode = "401", description = "Неверный текущий пароль")
    })
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            log.info("Changing password for user ID: {}", userId);

            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Password mismatch");
                error.put("message", "New password and confirmation do not match");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userService.findById(userId);

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid current password");
                error.put("message", "Current password is incorrect");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            if (request.getNewPassword().length() < 6) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid new password");
                error.put("message", "New password must be at least 6 characters long");
                return ResponseEntity.badRequest().body(error);
            }

            userService.updatePassword(userId, request.getNewPassword());
            tokenService.deleteAllUserTokens(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully. Please login again.");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Password change failed for user ID: {}", userId, e);

            Map<String, String> error = new HashMap<>();
            error.put("error", "Password change failed");
            error.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            log.error("Unexpected error during password change: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", "An unexpected error occurred");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Получение информации о текущем пользователе")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Информация успешно получена"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован")
    })
    public ResponseEntity<?> getCurrentUser(@RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("Getting current user info for ID: {}", userId);

            User user = userService.findById(userId);
            user.setPasswordHash(null);

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("roles", userService.getUserRoles(userId));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Failed to get user info: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found");
            error.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);

        } catch (Exception e) {
            log.error("Unexpected error getting user info: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", "An unexpected error occurred");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "Обновление профиля пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль успешно обновлен"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса")
    })
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            log.info("Updating profile for user ID: {}", userId);

            User updatedUser = userService.updateUserProfile(
                    userId,
                    request.getFullName(),
                    request.getTelephone()
            );

            updatedUser.setPasswordHash(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Profile update failed: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Profile update failed");
            error.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            log.error("Unexpected error during profile update: {}", e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", "An unexpected error occurred");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/check-email")
    @Operation(summary = "Проверка доступности email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Результат проверки")
    })
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

            Map<String, String> error = new HashMap<>();
            error.put("error", "Check failed");
            error.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Проверка состояния сервиса")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "user-service-auth");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }

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
                .message("Authentication successful")
                .build();
    }
}