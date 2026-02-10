-- 03_reports_vw.sql
-- Aqui van las views para los reportes
BEGIN;

-- =====================================================================
-- VIEW 1: Ventas por dia
-- Muestra: cuanto se vendio cada dia, cuantos tickets y el promedio
-- Para probar: SELECT * FROM reports.vw_sales_daily WHERE day >= '2026-01-01' LIMIT 10;
-- =====================================================================

CREATE OR REPLACE VIEW reports.vw_sales_daily AS
WITH daily_orders AS (
  -- primero sacamos el total de cada orden por dia
  SELECT
    DATE(o.created_at) AS day,
    o.id AS order_id,
    SUM(oi.qty * oi.unit_price) AS order_total
  FROM orders o
  INNER JOIN order_items oi ON o.id = oi.order_id
  WHERE o.status = 'paid'
  GROUP BY DATE(o.created_at), o.id
)
SELECT
  day,
  SUM(order_total) AS total_ventas,
  COUNT(order_id) AS tickets,
  -- calculamos el promedio, si es 0 ponemos 0 para evitar error
  COALESCE(ROUND(SUM(order_total) / NULLIF(COUNT(order_id), 0), 2), 0) AS ticket_promedio,
  -- agregamos una etiqueta de nivel
  CASE
    WHEN SUM(order_total) > 3000 THEN 'Alto'
    WHEN SUM(order_total) > 1500 THEN 'Medio'
    ELSE 'Bajo'
  END AS nivel_ventas
FROM daily_orders
GROUP BY day
HAVING SUM(order_total) > 0  -- solo dias con ventas
ORDER BY day DESC;


-- =====================================================================
-- VIEW 2: Top productos (los mas vendidos)
-- Muestra: ranking de productos por dinero y por cantidad vendida
-- Para probar: SELECT * FROM reports.vw_top_products_ranked LIMIT 10;
-- =====================================================================

CREATE OR REPLACE VIEW reports.vw_top_products_ranked AS
WITH product_sales AS (
  -- sumamos ventas por producto
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    SUM(oi.qty * oi.unit_price) AS total_revenue,
    SUM(oi.qty) AS total_qty
  FROM products p
  INNER JOIN order_items oi ON p.id = oi.product_id
  INNER JOIN orders o ON oi.order_id = o.id
  INNER JOIN categories c ON p.category_id = c.id
  WHERE o.status = 'paid'
  GROUP BY p.id, p.name, c.name
  HAVING SUM(oi.qty) > 0  -- solo productos que se han vendido
)
SELECT
  product_id,
  product_name,
  category_name,
  total_revenue,
  total_qty,
  -- usamos RANK para hacer el ranking
  RANK() OVER (ORDER BY total_revenue DESC) AS revenue_rank,
  RANK() OVER (ORDER BY total_qty DESC) AS qty_rank,
  ROUND(total_revenue / NULLIF(total_qty, 0), 2) AS avg_price_per_unit
FROM product_sales
ORDER BY total_revenue DESC;


-- =====================================================================
-- VIEW 3: vw_inventory_risk
-- Descripción: Productos con stock bajo y nivel de riesgo
-- Grain: Un registro por producto
-- Métricas: stock actual, ventas recientes, porcentaje de riesgo
-- Requisitos: CASE significativo, campo calculado (porcentaje), agregados
-- Filtros Productos con riesgo en inventario
-- Muestra: que productos tienen poco stock y pueden acabarse
-- Para probar: SELECT * FROM reports.vw_inventory_risk WHERE risk_level = 'Crítico';
-- =====================================================================

CREATE OR REPLACE VIEW reports.vw_inventory_risk AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  c.id AS category_id,
  c.name AS category_name,
  p.stock AS stock_actual,
  p.price,
  -- vemos cuanto se vendio en el ultimo mes
  COALESCE(SUM(oi.qty), 0) AS ventas_ultimos_30_dias,
  -- clasificamos el nivel de riesgo segun el stock
  CASE
    WHEN p.stock = 0 THEN 'Sin Stock'
    WHEN p.stock <= 5 THEN 'Crítico'
    WHEN p.stock <= 15 THEN 'Bajo'
    WHEN p.stock <= 30 THEN 'Medio'
    ELSE 'Suficiente'
  END AS risk_level,
  -- calculamos porcentaje de riesgo
FROM products p
INNER JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= CURRENT_DATE - INTERVAL '30 days' AND o.status = 'paid'
WHERE p.active = TRUE
GROUP BY p.id, p.name, c.id, c.name, p.stock, p.price, p.active
ORDER BY p.stock ASC, ventas_ultimos_30_dias DESC;


-- =====================================================================
-- VIEW 4: vw_customer_value
-- Descripción: Valor total gastado por cliente con métricas de frecuencia
-- Grain: Un registro por cliente
-- Métricas: total_gastado (SUM), num_ordenes (COUNT), gasto_promedio (AVG)
-- RequisitValor de los clientes
-- Muestra: cuanto ha gastado cada cliente y cuantas veces ha comprado
-- Para probar: SELECT * FROM reports.vw_customer_value ORDER BY total_gastado DESC;
-- =====================================================================

CREATE OR REPLACE VIEW reports.vw_customer_value AS
WITH customer_orders AS (
  -- sacamos el total de cada orden por cliente
  SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    c.email,
    o.id AS order_id,
    SUM(oi.qty * oi.unit_price) AS order_total
  FROM customers c
  INNER JOIN orders o ON c.id = o.customer_id
  INNER JOIN order_items oi ON o.id = oi.order_id
  WHERE o.status = 'paid'
  GROUP BY c.id, c.name, c.email, o.id
)
SELECT
  customer_id,
  customer_name,
  email,
  COUNT(order_id) AS num_ordenes,
  SUM(order_total) AS total_gastado,
  ROUND(AVG(order_total), 2) AS gasto_promedio,
  MAX(order_total) AS orden_maxima,
  MIN(order_total) AS orden_minima,
  -- clasificamos los clientes segun cuanto compran
  CASE
    WHEN COUNT(order_id) >= 5 THEN 'VIP'
    WHEN COUNT(order_id) >= 3 THEN 'Frecuente'
    WHEN COUNT(order_id) >= 2 THEN 'Regular'
    ELSE 'Nuevo'
  END AS segmento_cliente
FROM customer_orders
GROUP BY customer_id, customer_name, email
HAVING COUNT(order_id) > 0  -- solo clientes que han comprado==============================================
-- VIEW 5: vw_payment_mix
-- Descripción: Distribución de métodos de pago con totales y porcentajes
-- Grain: Un registro por método de pago
-- Métricas: total_amount (SUM), num_payments (COUNT), porcentaje sobre total
-- Requisitos: CTE, agregados, campo calculado (porcentaje), COALESCE
-- ========Mix de metodos de pago
-- Muestra: como paga la gente (efectivo, tarjeta, app) y los porcentajes
-- Para probar: SELECT * FROM reports.vw_payment_mix;
-- =====================================================================

CREATE OR REPLACE VIEW reports.vw_payment_mix AS
WITH payment_totals AS (
  -- sumamos por metodo de pago
  SELECT
    p.method AS payment_method,
    SUM(p.paid_amount) AS total_amount,
    COUNT(p.id) AS num_payments
  FROM payments p
  INNER JOIN orders o ON p.order_id = o.id
  WHERE o.status = 'paid'
  GROUP BY p.method
),
grand_total AS (
  -- sacamos el total general para calcular porcentajes
  SELECT SUM(total_amount) AS total_general
  FROM payment_totals
)
SELECT
  pt.payment_method,
  pt.total_amount,
  pt.num_payments,
  ROUND(pt.total_amount / NULLIF(pt.num_payments, 0), 2) AS avg_per_payment,
  -- calculamos el porcentaje de cada metodo
  ROUND((pt.total_amount / NULLIF(gt.total_general, 0)) * 100, 2) AS porcentaje,
  -- agregamos una etiqueta del tipo de metodo
  CASE
    WHEN pt.payment_method = 'cash' THEN 'Efectivo'
    WHEN pt.payment_method = 'card' THEN 'Tarjeta'
    WHEN pt.payment_method = 'app' THEN 'Digital'
    ELSE 'Otro'
  END AS tipo_metodo
FROM payment_totals pt
CROSS JOIN grand_total gt
ORDER BY pt.total_amount DESC;

COMMIT;
