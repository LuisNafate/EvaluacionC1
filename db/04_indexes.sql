-- 04_indexes.sql
-- Indices para que las consultas sean mas rapidas
BEGIN;

-- Indice para buscar ordenes por fecha
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Indice para filtrar ordenes pagadas
CREATE INDEX idx_orders_status ON orders(status);

-- Indices para los joins (para que vayan mas rapido)
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Indice para filtrar productos por categoria
CREATE INDEX idx_products_category_id ON products(category_id);

-- Indice para filtrar productos activos
CREATE INDEX idx_products_active ON products(active);

-- Indice para join de pagos
CREATE INDEX idx_payments_order_id ON payments(order_id);

-- Indice combinado para cuando buscamos por status y fecha juntos
CREATE INDEX idx_orders_status_created_at ON orders(status, created_at);

COMMIT;

-- Nota: para ver si los indices funcionan, podemos usar EXPLAIN antes de la consulta
-- Ejemplo: EXPLAIN SELECT * FROM reports.vw_sales_daily WHERE day >= '2026-01-01';
