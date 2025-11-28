CREATE TABLE restaurant (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            cuisine VARCHAR(100) NOT NULL,
                            address TEXT NOT NULL
);

CREATE INDEX idx_restaurant_cuisine ON restaurant(cuisine);