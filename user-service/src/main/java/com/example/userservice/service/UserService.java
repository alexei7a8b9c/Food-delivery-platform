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
import java.util.List;
import java.util.Optional;

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

        // Проверяем, существует ли пользователь с таким email
        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("Email already exists: {}", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        // Создаем нового пользователя
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setTelephone(request.getTelephone());

        // Назначаем роль USER по умолчанию
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

    public User findByEmail(String email) {
        log.info("Finding user by email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new RuntimeException("User not found");
                });
    }

    public User findById(Long id) {
        log.info("Finding user by ID: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });
    }

    @Transactional
    public User updateUser(Long userId, User updatedUser) {
        log.info("Updating user with ID: {}", userId);

        User existingUser = findById(userId);

        // Обновляем только разрешенные поля
        if (updatedUser.getFullName() != null) {
            existingUser.setFullName(updatedUser.getFullName());
        }

        if (updatedUser.getTelephone() != null) {
            existingUser.setTelephone(updatedUser.getTelephone());
        }

        // Не обновляем email и password здесь
        // Для обновления пароля нужен отдельный метод

        User savedUser = userRepository.save(existingUser);
        log.info("User updated successfully with ID: {}", userId);

        return savedUser;
    }

    @Transactional
    public void updatePassword(Long userId, String newPassword) {
        log.info("Updating password for user ID: {}", userId);

        User user = findById(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password updated for user ID: {}", userId);
    }

    @Transactional
    public void deleteUser(Long userId) {
        log.info("Deleting user with ID: {}", userId);

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        userRepository.deleteById(userId);
        log.info("User deleted successfully with ID: {}", userId);
    }

    public List<User> findAllUsers() {
        log.info("Finding all users");
        return userRepository.findAll();
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User addRoleToUser(Long userId, String roleName) {
        log.info("Adding role {} to user ID: {}", roleName, userId);

        User user = findById(userId);
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });

        user.getRoles().add(role);
        User savedUser = userRepository.save(user);

        log.info("Role {} added to user ID: {}", roleName, userId);
        return savedUser;
    }

    @Transactional
    public User removeRoleFromUser(Long userId, String roleName) {
        log.info("Removing role {} from user ID: {}", roleName, userId);

        User user = findById(userId);
        Optional<Role> role = roleRepository.findByName(roleName);

        if (role.isPresent()) {
            user.getRoles().remove(role.get());
            User savedUser = userRepository.save(user);
            log.info("Role {} removed from user ID: {}", roleName, userId);
            return savedUser;
        }

        log.warn("Role {} not found for user ID: {}", roleName, userId);
        return user;
    }

    public boolean hasRole(Long userId, String roleName) {
        User user = findById(userId);
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }

    @Transactional
    public User updateProfile(Long userId, String fullName, String telephone) {
        log.info("Updating profile for user ID: {}", userId);

        User user = findById(userId);

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName);
        }

        if (telephone != null && !telephone.trim().isEmpty()) {
            user.setTelephone(telephone);
        }

        User savedUser = userRepository.save(user);
        log.info("Profile updated for user ID: {}", userId);

        return savedUser;
    }

    public User findByEmailAndPassword(String email, String password) {
        log.info("Finding user by email and password: {}", email);

        User user = findByEmail(email);
        if (passwordEncoder.matches(password, user.getPasswordHash())) {
            return user;
        }

        throw new RuntimeException("Invalid credentials");
    }

    public List<User> searchUsers(String keyword) {
        log.info("Searching users with keyword: {}", keyword);

        // Реализуем простой поиск по имени и email
        return userRepository.findAll().stream()
                .filter(user ->
                        user.getFullName().toLowerCase().contains(keyword.toLowerCase()) ||
                                user.getEmail().toLowerCase().contains(keyword.toLowerCase()))
                .toList();
    }

    public long countUsers() {
        return userRepository.count();
    }

    public List<User> getUsersByRole(String roleName) {
        log.info("Getting users by role: {}", roleName);

        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName().equals(roleName)))
                .toList();
    }

    @Transactional
    public void deactivateUser(Long userId) {
        log.info("Deactivating user ID: {}", userId);

        // В реальном приложении здесь может быть логика деактивации
        // Например, установка поля isActive = false
        // Для простоты просто логируем

        log.info("User ID: {} deactivated", userId);
    }

    @Transactional
    public void activateUser(Long userId) {
        log.info("Activating user ID: {}", userId);

        // В реальном приложении здесь может быть логика активации
        // Например, установка поля isActive = true
        // Для простоты просто логируем

        log.info("User ID: {} activated", userId);
    }

    public User getUserWithRoles(Long userId) {
        log.info("Getting user with roles for ID: {}", userId);

        User user = findById(userId);
        // Загружаем роли (если они не загружены по умолчанию)
        user.getRoles().size(); // Это загрузит коллекцию если она LAZY

        return user;
    }

    @Transactional
    public User setUserRoles(Long userId, List<String> roleNames) {
        log.info("Setting roles for user ID: {}", userId);

        User user = findById(userId);
        user.getRoles().clear();

        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(roleName);
                        return roleRepository.save(newRole);
                    });
            user.getRoles().add(role);
        }

        User savedUser = userRepository.save(user);
        log.info("Roles set for user ID: {}", userId);

        return savedUser;
    }

    public List<String> getUserRoles(Long userId) {
        User user = findById(userId);
        return user.getRoles().stream()
                .map(Role::getName)
                .toList();
    }

    @Transactional
    public User changeEmail(Long userId, String newEmail) {
        log.info("Changing email for user ID: {}", userId);

        if (userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email already exists");
        }

        User user = findById(userId);
        user.setEmail(newEmail);

        User savedUser = userRepository.save(user);
        log.info("Email changed for user ID: {}", userId);

        return savedUser;
    }
}