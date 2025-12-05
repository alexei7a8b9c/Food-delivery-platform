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

        // ВСЕГДА назначаем только роль USER при регистрации
        // Админ или менеджер должны быть назначены через отдельный endpoint
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    log.warn("USER role not found, creating it...");
                    Role newRole = new Role();
                    newRole.setName("USER");
                    return roleRepository.save(newRole);
                });

        user.setRoles(Collections.singleton(userRole));
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());
        return savedUser;
    }

    // ДОБАВИТЬ: метод для назначения ролей админом
    @Transactional
    public User assignRoleToUser(Long userId, String roleName) {
        User user = findById(userId);

        // Приводим роль к верхнему регистру
        String normalizedRoleName = roleName.toUpperCase();

        Role role = roleRepository.findByName(normalizedRoleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + normalizedRoleName));

        // Проверяем, есть ли уже эта роль у пользователя
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            log.info("Assigned role '{}' to user '{}' (ID: {})",
                    roleName, user.getEmail(), user.getId());
        } else {
            log.info("User '{}' already has role '{}'", user.getEmail(), roleName);
        }

        return userRepository.save(user);
    }

    // ДОБАВИТЬ: метод для удаления роли у пользователя
    @Transactional
    public User removeRoleFromUser(Long userId, String roleName) {
        User user = findById(userId);

        // Приводим роль к верхнему регистру
        String normalizedRoleName = roleName.toUpperCase();

        Role role = roleRepository.findByName(normalizedRoleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + normalizedRoleName));

        if (user.getRoles().contains(role)) {
            user.getRoles().remove(role);
            log.info("Removed role '{}' from user '{}' (ID: {})",
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
}