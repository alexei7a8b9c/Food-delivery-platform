-- Назначить роль ADMIN пользователю user@example.com
INSERT INTO user_role (user_id, role_id)
SELECT
    u.id,
    r.id
FROM users u, roles r
WHERE u.email = 'user@example.com'
  AND r.name = 'ADMIN'
    ON CONFLICT DO NOTHING;

-- V11__Add_manager_role.sql

-- Убедимся, что роль MANAGER существует
INSERT INTO roles (name)
VALUES ('MANAGER')
    ON CONFLICT (name) DO NOTHING;

-- Назначить роль MANAGER пользователю manager@example.com
INSERT INTO user_role (user_id, role_id)
SELECT
    u.id,
    r.id
FROM users u, roles r
WHERE u.email = 'manager@example.com'
  AND r.name = 'MANAGER'
    ON CONFLICT DO NOTHING;

-- Также обновим существующего менеджера, если он уже имеет только роль MANAGER
-- Проверим и добавим роль USER если её нет
INSERT INTO user_role (user_id, role_id)
SELECT
    u.id,
    r.id
FROM users u
         CROSS JOIN roles r
WHERE u.email = 'manager@example.com'
  AND r.name = 'USER'
  AND NOT EXISTS (
    SELECT 1
    FROM user_role ur
    WHERE ur.user_id = u.id
      AND ur.role_id = r.id
)
    ON CONFLICT DO NOTHING;

