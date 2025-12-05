package com.example.userservice.service;

import com.example.userservice.dto.UserRegistrationRequest;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.repository.RoleRepository;
import com.example.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        log.info("Registering user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("Email already exists: {}", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setTelephone(request.getTelephone());

        // ВАЖНО: Все новые пользователи получают ТОЛЬКО роль USER
        // Роли ADMIN и MANAGER могут быть назначены только администратором
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    log.warn("USER role not found, creating it...");
                    Role newRole = new Role();
                    newRole.setName("USER");
                    return roleRepository.save(newRole);
                });

        // Убедимся, что только роль USER назначена
        user.setRoles(Collections.singleton(userRole));

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {} with ONLY USER role", savedUser.getId());
        return savedUser;
    }

    // Метод для назначения ролей ТОЛЬКО админом
    @Transactional
    public User assignRoleToUser(Long userId, String roleName) {
        User user = findById(userId);

        // Приводим роль к верхнему регистру
        String normalizedRoleName = roleName.toUpperCase();

        // Проверяем, существует ли такая роль
        Role role = roleRepository.findByName(normalizedRoleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + normalizedRoleName));

        // Проверяем, не пытаемся ли назначить роль USER через этот метод
        if ("USER".equals(normalizedRoleName)) {
            throw new RuntimeException("USER role is automatically assigned during registration. Use only for ADMIN or MANAGER roles.");
        }

        // Проверяем, есть ли уже эта роль у пользователя
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            log.info("Admin assigned role '{}' to user '{}' (ID: {})",
                    roleName, user.getEmail(), user.getId());
        } else {
            log.info("User '{}' already has role '{}'", user.getEmail(), roleName);
        }

        return userRepository.save(user);
    }

    // Метод для удаления роли (кроме USER)
    @Transactional
    public User removeRoleFromUser(Long userId, String roleName) {
        User user = findById(userId);

        String normalizedRoleName = roleName.toUpperCase();

        // Нельзя удалить базовую роль USER
        if ("USER".equals(normalizedRoleName)) {
            throw new RuntimeException("Cannot remove USER role. Every user must have at least USER role.");
        }

        Role role = roleRepository.findByName(normalizedRoleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + normalizedRoleName));

        if (user.getRoles().contains(role)) {
            user.getRoles().remove(role);
            log.info("Admin removed role '{}' from user '{}' (ID: {})",
                    roleName, user.getEmail(), user.getId());
        } else {
            log.info("User '{}' doesn't have role '{}'", user.getEmail(), roleName);
        }

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        log.info("Finding user by email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    String errorMessage = "User not found with email: " + email;
                    log.error(errorMessage);
                    return new RuntimeException("User not found");
                });
    }

    public User findById(Long id) {
        log.info("Finding user by ID: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    String errorMessage = "User not found with ID: " + id;
                    log.error(errorMessage);
                    return new RuntimeException("User not found");
                });
    }

    // Метод для проверки, является ли пользователь администратором
    public boolean isAdmin(Long userId) {
        User user = findById(userId);
        return user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getName()));
    }
}