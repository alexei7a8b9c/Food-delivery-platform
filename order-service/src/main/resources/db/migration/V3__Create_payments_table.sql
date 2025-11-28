CREATE TABLE payment (
                         id BIGSERIAL PRIMARY KEY,
                         order_id BIGINT NOT NULL,
                         method VARCHAR(50) NOT NULL,
                         amount INTEGER NOT NULL,
                         status VARCHAR(50) NOT NULL,

                         CONSTRAINT fk_payment_order
                             FOREIGN KEY (order_id)
                                 REFERENCES orders(id)
                                 ON DELETE CASCADE,

                         CONSTRAINT uk_payment_order
                             UNIQUE (order_id)
);

CREATE INDEX idx_payment_order_id ON payment(order_id);