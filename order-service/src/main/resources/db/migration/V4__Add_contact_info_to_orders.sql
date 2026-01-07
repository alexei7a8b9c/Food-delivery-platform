-- Добавляем новые поля для контактной информации в таблицу orders
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS customer_full_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS customer_telephone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Создаем индексы для новых полей
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_telephone);

-- Обновляем существующие тестовые заказы (опционально)
UPDATE orders SET
                  customer_email = 'user' || user_id || '@example.com',
                  customer_full_name = 'Customer ' || user_id,
                  customer_telephone = '+1-555-' || LPAD(user_id::text, 4, '0'),
                  delivery_address = '123 Main St, City ' || user_id
WHERE customer_email IS NULL;