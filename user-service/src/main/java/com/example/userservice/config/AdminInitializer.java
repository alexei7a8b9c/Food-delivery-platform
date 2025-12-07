package com.example.userservice.config;

import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.repository.RoleRepository;
import com.example.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Configuration
@Slf4j
public class AdminInitializer {

    @Bean
    @Transactional
    public CommandLineRunner initAdmin(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            // Проверяем, есть ли уже админ
            if (userRepository.findByEmail("admin@fooddelivery.com").isPresent()) {
                log.info("Admin user already exists");
                return;
            }

            log.info("Creating admin user...");

            // Создаем или получаем роли
            Role userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("USER");
                        return roleRepository.save(role);
                    });

            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("ADMIN");
                        return roleRepository.save(role);
                    });

            // Создаем пользователя админа
            User admin = new User();
            admin.setEmail("admin@fooddelivery.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123")); // Пароль: admin123
            admin.setFullName("System Administrator");
            admin.setTelephone("+1-555-0000");

            // Назначаем роли
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            roles.add(adminRole);
            admin.setRoles(roles);

            // Сохраняем
            User savedAdmin = userRepository.save(admin);
            log.info("Admin user created successfully with ID: {}", savedAdmin.getId());
        };
    }
}