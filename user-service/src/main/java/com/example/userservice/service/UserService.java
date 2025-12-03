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

        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("Email already exists: {}", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setTelephone(request.getTelephone());

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

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        log.info("Finding user by email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new RuntimeException("User not found");
                });
    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        log.info("Finding user by ID: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });
    }

    @Transactional(readOnly = true)
    public User findByIdWithRoles(Long id) {
        log.info("Finding user with roles by ID: {}", id);
        return userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateUserProfile(Long userId, String fullName, String telephone) {
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

    @Transactional
    public void updatePassword(Long userId, String newPassword) {
        log.info("Updating password for user ID: {}", userId);

        User user = findById(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password updated for user ID: {}", userId);
    }

    @Transactional(readOnly = true)
    public boolean validateCredentials(String email, String password) {
        try {
            User user = findByEmail(email);
            return passwordEncoder.matches(password, user.getPasswordHash());
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User addRoleToUser(Long userId, String roleName) {
        User user = findByIdWithRoles(userId);
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });

        user.getRoles().add(role);
        return userRepository.save(user);
    }

    @Transactional
    public User removeRoleFromUser(Long userId, String roleName) {
        User user = findByIdWithRoles(userId);
        Optional<Role> role = roleRepository.findByName(roleName);

        if (role.isPresent()) {
            user.getRoles().remove(role.get());
            return userRepository.save(user);
        }

        return user;
    }

    @Transactional(readOnly = true)
    public List<String> getUserRoles(Long userId) {
        User user = findByIdWithRoles(userId);
        return user.getRoles().stream()
                .map(Role::getName)
                .toList();
    }
}