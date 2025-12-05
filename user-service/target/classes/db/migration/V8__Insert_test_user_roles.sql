-- Удаляем старые связи
DELETE FROM user_role;

-- Назначаем роли только админу
-- Остальные пользователи получат роль USER при регистрации
INSERT INTO user_role (user_id, role_id) VALUES
    (1, (SELECT id FROM roles WHERE name = 'ADMIN'));
-- Больше никому не назначаем роли - они получат USER при регистрации