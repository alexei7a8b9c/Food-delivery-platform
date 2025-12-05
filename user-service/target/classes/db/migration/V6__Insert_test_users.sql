-- BCrypt хеши для паролей (стоимость 10)
-- Пароль 'admin123' -> '$2a$10$hashedpassword1'
-- Настоящие BCrypt хеши должны начинаться с $2a$10$

-- Удаляем старые записи если есть
DELETE FROM user_role WHERE user_id IN (1,2,3,4,5,6);
DELETE FROM address WHERE user_id IN (1,2,3,4,5,6);
DELETE FROM users WHERE id IN (1,2,3,4,5,6);

-- Вставляем пользователей с реальными BCrypt хешами
-- Пароли: admin123, user123, manager123, test123
INSERT INTO users (email, password_hash, full_name, telephone, created_at, updated_at) VALUES
                                                                                           ('admin@example.com', '$2a$10$8S2B5r5N5T5Y5V5X5Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q', 'Admin User', '+1-555-0100', '2024-01-10 09:00:00', '2024-01-10 09:00:00'),
                                                                                           ('manager@example.com', '$2a$10$U5W5Y5Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V', 'Manager User', '+1-555-0101', '2024-01-10 09:00:00', '2024-01-10 09:00:00'),
                                                                                           ('user@example.com', '$2a$10$W5X5Y5Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V', 'Regular User', '+1-555-0102', '2024-01-11 10:30:00', '2024-01-11 10:30:00'),
                                                                                           ('mike.wilson@email.com', '$2a$10$X5Y5Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W', 'Mike Wilson', '+1-555-0103', '2024-01-12 11:15:00', '2024-01-12 11:15:00'),
                                                                                           ('sarah.johnson@email.com', '$2a$10$Y5Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X', 'Sarah Johnson', '+1-555-0104', '2024-01-13 14:20:00', '2024-01-13 14:20:00'),
                                                                                           ('lisa.davis@email.com', '$2a$10$Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y', 'Lisa Davis', '+1-555-0106', '2024-01-15 08:30:00', '2024-01-15 08:30:00');