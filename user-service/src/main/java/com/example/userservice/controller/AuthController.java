package com.example.userservice.controller;

import com.example.userservice.dto.*;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.service.AuthenticationService;
import com.example.userservice.service.JwtService;
import com.example.userservice.service.TokenBlacklistService;
import com.example.userservice.service.UserService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;

    // Обработчик ошибок валидации
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(org.springframework.http.HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.error("Validation errors: {}", errors);
        return ResponseEntity.badRequest().body(errors);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            log.info("=== REGISTRATION START ===");
            log.info("Email: {}", request.getEmail());
            log.info("Full Name: {}", request.getFullName());
            log.info("Telephone: {}", request.getTelephone());
            log.info("Password length: {}", request.getPassword() != null ? request.getPassword().length() : 0);

            // Простая валидация
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Full name is required");
            }

            // Проверяем формат email
            if (!request.getEmail().contains("@")) {
                return ResponseEntity.badRequest().body("Invalid email format");
            }

            User user = userService.registerUser(request);
            log.info("User saved with ID: {}", user.getId());

            // После регистрации автоматически логиним пользователя
            try {
                SignInRequest signInRequest = new SignInRequest();
                signInRequest.setEmail(request.getEmail());
                signInRequest.setPassword(request.getPassword());

                JwtAuthenticationResponse jwtResponse = authenticationService.signIn(signInRequest);

                // Простой успешный ответ
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "User registered successfully");
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("fullName", user.getFullName());
                response.put("accessToken", jwtResponse.getAccessToken());

                if (jwtResponse.getRefreshToken() != null) {
                    response.put("refreshToken", jwtResponse.getRefreshToken());
                }

                log.info("=== REGISTRATION SUCCESS ===");
                return ResponseEntity.ok(response);

            } catch (Exception authException) {
                log.warn("Auto-login failed after registration: {}", authException.getMessage());

                // Все равно возвращаем успех, но без токена
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "User registered successfully. Please login manually.");
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("fullName", user.getFullName());

                log.info("=== REGISTRATION SUCCESS (without auto-login) ===");
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            log.error("=== REGISTRATION FAILED ===", e);

            // Детальный ответ об ошибке
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("exception", e.getClass().getSimpleName());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody SignInRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());

            // Простая валидация
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            // Проверяем существование пользователя
            User user = userService.findByEmail(request.getEmail());

            // Проверяем пароль
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                log.warn("Invalid password for email: {}", request.getEmail());
                return ResponseEntity.badRequest().body("Invalid credentials");
            }

            // Используем новый AuthenticationService
            JwtAuthenticationResponse jwtResponse = authenticationService.signIn(request);

            // Простой успешный ответ
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("accessToken", jwtResponse.getAccessToken());

            if (jwtResponse.getRefreshToken() != null) {
                response.put("refreshToken", jwtResponse.getRefreshToken());
            }

            log.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);

            // Проверяем, если это ошибка "пользователь не найден"
            if (e.getMessage() != null &&
                    (e.getMessage().contains("not found") ||
                            e.getMessage().contains("User not found"))) {
                return ResponseEntity.badRequest().body("User not found");
            }

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ДОБАВИТЬ: Проверка токена и ролей
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid authorization header");
            }

            String token = authHeader.substring(7);
            Claims claims = jwtService.extractClaims(token);

            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("username", claims.getSubject());
            response.put("userId", claims.get("userId"));
            response.put("email", claims.get("email"));
            response.put("fullName", claims.get("fullName"));
            response.put("roles", claims.get("roles"));
            response.put("authorities", claims.get("authorities"));
            response.put("expiration", claims.getExpiration());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/debug/user/{id}")
    public ResponseEntity<?> debugUser(@PathVariable Long id) {
        try {
            User user = userService.findById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("roles", user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList()));
            response.put("authorities", user.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}