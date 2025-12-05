INSERT INTO roles (name) VALUES
                             ('USER'),
                             ('MANAGER'),
                             ('ADMIN')
    ON CONFLICT (name) DO NOTHING;