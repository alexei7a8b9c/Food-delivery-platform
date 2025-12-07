-- Назначить роль ADMIN пользователю user@example.com
INSERT INTO user_role (user_id, role_id)
SELECT
    u.id,
    r.id
FROM users u, roles r
WHERE u.email = 'user@example.com'
  AND r.name = 'ADMIN'
    ON CONFLICT DO NOTHING;