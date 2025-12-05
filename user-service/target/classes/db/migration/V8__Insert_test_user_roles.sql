-- Удаляем старые связи
DELETE FROM user_role;

-- Назначаем роли тестовым пользователям
-- Админ
INSERT INTO user_role (user_id, role_id) VALUES
                                             (1, (SELECT id FROM roles WHERE name = 'ADMIN')),
                                             (1, (SELECT id FROM roles WHERE name = 'MANAGER')),
                                             (1, (SELECT id FROM roles WHERE name = 'USER'));

-- Менеджер
INSERT INTO user_role (user_id, role_id) VALUES
                                             (2, (SELECT id FROM roles WHERE name = 'MANAGER')),
                                             (2, (SELECT id FROM roles WHERE name = 'USER'));

-- Обычный пользователь
INSERT INTO user_role (user_id, role_id) VALUES
    (3, (SELECT id FROM roles WHERE name = 'USER'));

-- Остальные пользователи получают только роль USER
INSERT INTO user_role (user_id, role_id) VALUES
                                             (4, (SELECT id FROM roles WHERE name = 'USER')),
                                             (5, (SELECT id FROM roles WHERE name = 'USER')),
                                             (6, (SELECT id FROM roles WHERE name = 'USER'));