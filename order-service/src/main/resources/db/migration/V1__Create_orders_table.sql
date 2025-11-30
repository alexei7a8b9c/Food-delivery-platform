CREATE TABLE orders (
                        id BIGSERIAL PRIMARY KEY,
                        status VARCHAR(50) NOT NULL,
                        order_date TIMESTAMP NOT NULL,
                        user_id BIGINT NOT NULL, -- ИЗМЕНИТЬ INTEGER на BIGINT
                        restaurant_id BIGINT NOT NULL, -- ИЗМЕНИТЬ INTEGER на BIGINT
                        total_price INTEGER NOT NULL
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);