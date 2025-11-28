CREATE TABLE role (
                      id BIGSERIAL PRIMARY KEY,
                      name VARCHAR(50) NOT NULL UNIQUE
);

CREATE INDEX idx_role_name ON role(name);