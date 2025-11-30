CREATE TABLE order_item (
                            id BIGSERIAL PRIMARY KEY,
                            order_id BIGINT NOT NULL,
                            dish_id BIGINT NOT NULL,
                            quantity INTEGER NOT NULL,
                            price INTEGER NOT NULL,
                            dish_name VARCHAR(255),
                            dish_description TEXT,
                            CONSTRAINT fk_order_item_order
                                FOREIGN KEY (order_id)
                                    REFERENCES orders(id)
                                    ON DELETE CASCADE
);

CREATE INDEX idx_order_item_order_id ON order_item(order_id);
CREATE INDEX idx_order_item_dish_id ON order_item(dish_id);