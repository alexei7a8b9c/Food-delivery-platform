package com.example.userservice.controller;

import com.example.userservice.dto.AuthResponse;
import com.example.userservice.dto.LoginRequest;
import com.example.userservice.dto.UserRegistrationRequest;
import com.example.userservice.model.User;
import com.example.userservice.service.JwtService;
import com.example.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            log.info("Registering user with email: {}", request.getEmail());
            User user = userService.registerUser(request);
            String token = jwtService.generateToken(user.getEmail(), user.getId());

            AuthResponse response = new AuthResponse(token, user.getEmail(), user.getFullName(), user.getId());
            log.info("User registered successfully: {}", user.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());
            User user = userService.findByEmail(request.getEmail());

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                log.warn("Invalid password for email: {}", request.getEmail());
                return ResponseEntity.badRequest().body("Invalid credentials");
            }

            String token = jwtService.generateToken(user.getEmail(), user.getId());
            AuthResponse response = new AuthResponse(token, user.getEmail(), user.getFullName(), user.getId());

            log.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            log.info("Validating token");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid token format");
            }

            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                return ResponseEntity.badRequest().body("Invalid token");
            }

            String username = jwtService.extractUsername(token);
            Long userId = jwtService.extractUserId(token);
            User user = userService.findByEmail(username);

            AuthResponse response = new AuthResponse(token, user.getEmail(), user.getFullName(), user.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Token validation failed", e);
            return ResponseEntity.badRequest().body("Token validation failed");
        }
    }
}