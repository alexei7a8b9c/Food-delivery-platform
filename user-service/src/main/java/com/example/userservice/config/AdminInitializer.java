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
            } else {
                log.info("Creating admin user...");
                createAdminUser(userRepository, roleRepository, passwordEncoder);
            }

            // Проверяем, есть ли уже менеджер
            if (userRepository.findByEmail("manager@fooddelivery.com").isPresent()) {
                log.info("Manager user already exists");
            } else {
                log.info("Creating manager user...");
                createManagerUser(userRepository, roleRepository, passwordEncoder);
            }
        };
    }

    private void createAdminUser(UserRepository userRepository, RoleRepository roleRepository,
                                 PasswordEncoder passwordEncoder) {
        // Создаем или получаем роли
        Role userRole = getOrCreateRole(roleRepository, "USER");
        Role adminRole = getOrCreateRole(roleRepository, "ADMIN");
        Role managerRole = getOrCreateRole(roleRepository, "MANAGER");

        // Создаем пользователя админа
        User admin = new User();
        admin.setEmail("admin@fooddelivery.com");
        admin.setPasswordHash(passwordEncoder.encode("admin123")); // Пароль: admin123
        admin.setFullName("System Administrator");
        admin.setTelephone("+1-555-0000");

        // Назначаем роли (админ имеет все роли)
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(userRole);
        adminRoles.add(managerRole);
        adminRoles.add(adminRole);
        admin.setRoles(adminRoles);

        // Сохраняем
        User savedAdmin = userRepository.save(admin);
        log.info("Admin user created successfully with ID: {}", savedAdmin.getId());
    }

    private void createManagerUser(UserRepository userRepository, RoleRepository roleRepository,
                                   PasswordEncoder passwordEncoder) {
        // Создаем или получаем роли
        Role userRole = getOrCreateRole(roleRepository, "USER");
        Role managerRole = getOrCreateRole(roleRepository, "MANAGER");

        // Создаем пользователя менеджера
        User manager = new User();
        manager.setEmail("manager@fooddelivery.com");
        manager.setPasswordHash(passwordEncoder.encode("manager123")); // Пароль: manager123
        manager.setFullName("Restaurant Manager");
        manager.setTelephone("+1-555-1111");

        // Назначаем роли (менеджер имеет USER и MANAGER)
        Set<Role> managerRoles = new HashSet<>();
        managerRoles.add(userRole);
        managerRoles.add(managerRole);
        manager.setRoles(managerRoles);

        // Сохраняем
        User savedManager = userRepository.save(manager);
        log.info("Manager user created successfully with ID: {}", savedManager.getId());
    }

    private Role getOrCreateRole(RoleRepository roleRepository, String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });
    }
}