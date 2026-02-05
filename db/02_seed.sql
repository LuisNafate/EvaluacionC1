-- 02_seed.sql
-- Datos realistas y creíbles para demostrar reportes
BEGIN;

-- Categorías (8 categorías)
INSERT INTO categories (name) VALUES
  ('Cafés'),
  ('Tés e Infusiones'),
  ('Postres'),
  ('Sandwiches'),
  ('Bebidas Frías'),
  ('Desayunos'),
  ('Snacks'),
  ('Especiales');

-- Productos (25 productos con variedad de stock)
INSERT INTO products (name, category_id, price, stock, active) VALUES
  -- Cafés
  ('Espresso', 1, 35.00, 50, TRUE),
  ('Americano', 1, 40.00, 45, TRUE),
  ('Cappuccino', 1, 50.00, 40, TRUE),
  ('Latte', 1, 55.00, 35, TRUE),
  ('Mocha', 1, 60.00, 8, TRUE), -- stock bajo
  
  -- Tés
  ('Té Verde', 2, 35.00, 30, TRUE),
  ('Té Negro', 2, 35.00, 25, TRUE),
  ('Chai Latte', 2, 50.00, 4, TRUE), -- stock bajo
  
  -- Postres
  ('Cheesecake', 3, 75.00, 15, TRUE),
  ('Brownie', 3, 55.00, 20, TRUE),
  ('Cookie Chocolate', 3, 30.00, 2, TRUE), -- stock bajo
  ('Croissant', 3, 40.00, 18, TRUE),
  
  -- Sandwiches
  ('Club Sandwich', 4, 95.00, 20, TRUE),
  ('Panini de Pollo', 4, 85.00, 5, TRUE), -- stock bajo
  ('Wrap Vegetariano', 4, 80.00, 15, TRUE),
  
  -- Bebidas Frías
  ('Limonada Natural', 5, 40.00, 35, TRUE),
  ('Smoothie Fresa', 5, 60.00, 25, TRUE),
  ('Jugo Naranja', 5, 45.00, 30, TRUE),
  
  -- Desayunos
  ('Desayuno Continental', 6, 120.00, 12, TRUE),
  ('Hotcakes', 6, 85.00, 3, TRUE), -- stock bajo
  ('Yogurt con Granola', 6, 65.00, 18, TRUE),
  
  -- Snacks
  ('Nachos', 7, 70.00, 22, TRUE),
  ('Papas Fritas', 7, 50.00, 28, TRUE),
  
  -- Especiales
  ('Café de Especialidad', 8, 85.00, 10, TRUE),
  ('Cold Brew', 8, 70.00, 1, TRUE); -- stock bajo

-- Clientes (20 clientes)
INSERT INTO customers (name, email) VALUES
  ('Ana Martínez', 'ana.martinez@email.com'),
  ('Carlos López', 'carlos.lopez@email.com'),
  ('María García', 'maria.garcia@email.com'),
  ('Juan Rodríguez', 'juan.rodriguez@email.com'),
  ('Laura Hernández', 'laura.hernandez@email.com'),
  ('Pedro Sánchez', 'pedro.sanchez@email.com'),
  ('Carmen Díaz', 'carmen.diaz@email.com'),
  ('Luis Pérez', 'luis.perez@email.com'),
  ('Isabel Torres', 'isabel.torres@email.com'),
  ('Miguel Ramírez', 'miguel.ramirez@email.com'),
  ('Rosa Flores', 'rosa.flores@email.com'),
  ('Jorge Castro', 'jorge.castro@email.com'),
  ('Elena Morales', 'elena.morales@email.com'),
  ('Roberto Jiménez', 'roberto.jimenez@email.com'),
  ('Patricia Ruiz', 'patricia.ruiz@email.com'),
  ('Fernando Gómez', 'fernando.gomez@email.com'),
  ('Lucía Vargas', 'lucia.vargas@email.com'),
  ('Andrés Mendoza', 'andres.mendoza@email.com'),
  ('Sofía Ortiz', 'sofia.ortiz@email.com'),
  ('Ricardo Silva', 'ricardo.silva@email.com');

-- Órdenes (55 órdenes distribuidas en Enero-Febrero 2026)
-- Enero 2026
INSERT INTO orders (customer_id, created_at, status, channel) VALUES
  (1, '2026-01-02 08:15:00', 'paid', 'mostrador'),
  (2, '2026-01-02 10:30:00', 'paid', 'app'),
  (3, '2026-01-03 09:20:00', 'paid', 'mostrador'),
  (4, '2026-01-03 13:45:00', 'paid', 'app'),
  (5, '2026-01-04 08:50:00', 'paid', 'mostrador'),
  (1, '2026-01-04 11:25:00', 'paid', 'app'),
  (6, '2026-01-05 09:35:00', 'paid', 'mostrador'),
  (7, '2026-01-05 14:10:00', 'paid', 'app'),
  (8, '2026-01-06 08:40:00', 'paid', 'mostrador'),
  (9, '2026-01-06 10:55:00', 'paid', 'app'),
  (10, '2026-01-07 09:25:00', 'paid', 'mostrador'),
  (11, '2026-01-07 13:30:00', 'cancelled', 'app'),
  (12, '2026-01-08 08:30:00', 'paid', 'mostrador'),
  (2, '2026-01-08 11:45:00', 'paid', 'app'),
  (13, '2026-01-09 09:40:00', 'paid', 'mostrador'),
  (14, '2026-01-09 14:20:00', 'paid', 'app'),
  (15, '2026-01-10 08:25:00', 'paid', 'mostrador'),
  (3, '2026-01-10 10:50:00', 'paid', 'app'),
  (16, '2026-01-11 09:30:00', 'paid', 'mostrador'),
  (17, '2026-01-11 13:55:00', 'paid', 'app'),
  (18, '2026-01-12 08:45:00', 'paid', 'mostrador'),
  (1, '2026-01-12 11:20:00', 'paid', 'app'),
  (19, '2026-01-13 09:35:00', 'paid', 'mostrador'),
  (20, '2026-01-13 14:40:00', 'paid', 'app'),
  (4, '2026-01-14 08:20:00', 'paid', 'mostrador'),
  (5, '2026-01-15 09:50:00', 'paid', 'app'),
  (6, '2026-01-16 08:35:00', 'paid', 'mostrador'),
  (7, '2026-01-17 09:15:00', 'paid', 'app'),
  (8, '2026-01-18 08:50:00', 'paid', 'mostrador'),
  (9, '2026-01-19 09:40:00', 'paid', 'app'),
  (10, '2026-01-20 08:30:00', 'paid', 'mostrador'),
  (2, '2026-01-21 09:25:00', 'paid', 'app'),
  (11, '2026-01-22 08:40:00', 'paid', 'mostrador'),
  (12, '2026-01-23 09:50:00', 'paid', 'app'),
  (13, '2026-01-24 08:25:00', 'paid', 'mostrador'),
  (3, '2026-01-25 09:30:00', 'paid', 'app'),
  (14, '2026-01-26 08:45:00', 'paid', 'mostrador'),
  (15, '2026-01-27 09:20:00', 'paid', 'app'),
  (16, '2026-01-28 08:35:00', 'paid', 'mostrador'),
  (4, '2026-01-29 09:40:00', 'paid', 'app'),
  (17, '2026-01-30 08:50:00', 'paid', 'mostrador'),
  (18, '2026-01-31 09:35:00', 'paid', 'app');

-- Febrero 2026
INSERT INTO orders (customer_id, created_at, status, channel) VALUES
  (1, '2026-02-01 08:30:00', 'paid', 'mostrador'),
  (19, '2026-02-01 11:15:00', 'paid', 'app'),
  (20, '2026-02-02 09:45:00', 'paid', 'mostrador'),
  (5, '2026-02-02 14:25:00', 'paid', 'app'),
  (6, '2026-02-03 08:40:00', 'paid', 'mostrador'),
  (2, '2026-02-03 10:50:00', 'paid', 'app'),
  (7, '2026-02-04 09:30:00', 'paid', 'mostrador'),
  (8, '2026-02-04 13:35:00', 'paid', 'app'),
  (9, '2026-02-05 08:20:00', 'paid', 'mostrador'),
  (10, '2026-02-05 11:40:00', 'paid', 'app'),
  (3, '2026-02-05 14:15:00', 'paid', 'mostrador');

-- Order items (2-3 items por orden)
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES
-- Order items (2-3 items por orden)
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES
  -- Enero (órdenes 1-42)
  (1, 1, 2, 35.00), (1, 10, 1, 55.00),
  (2, 3, 1, 50.00), (2, 9, 1, 75.00),
  (3, 4, 2, 55.00), (3, 12, 1, 40.00),
  (4, 2, 1, 40.00), (4, 21, 1, 65.00),
  (5, 13, 1, 95.00), (5, 16, 1, 40.00),
  (6, 1, 3, 35.00), (6, 10, 2, 55.00),
  (7, 6, 1, 35.00), (7, 9, 1, 75.00),
  (8, 19, 1, 120.00), (8, 16, 1, 40.00),
  (9, 3, 2, 50.00), (9, 12, 1, 40.00),
  (10, 14, 1, 85.00), (10, 17, 1, 60.00),
  (11, 13, 1, 95.00), (11, 18, 1, 45.00),
  -- orden 12 cancelada
  (12, 4, 1, 55.00), (12, 16, 2, 40.00),
  (13, 1, 2, 35.00), (13, 24, 1, 85.00),
  (14, 7, 1, 35.00), (14, 9, 1, 75.00),
  (15, 15, 1, 80.00), (15, 18, 1, 45.00),
  (16, 3, 2, 50.00), (16, 10, 1, 55.00),
  (17, 2, 3, 40.00), (17, 12, 1, 40.00),
  (18, 6, 1, 35.00), (18, 22, 1, 70.00),
  (19, 1, 2, 35.00), (19, 9, 1, 75.00),
  (20, 13, 1, 95.00), (20, 17, 1, 60.00),
  (21, 19, 1, 120.00), (21, 16, 1, 40.00),
  (22, 4, 2, 55.00), (22, 10, 1, 55.00),
  (23, 3, 1, 50.00), (23, 12, 2, 40.00),
  (24, 7, 2, 35.00), (24, 9, 1, 75.00),
  (25, 14, 1, 85.00), (25, 18, 1, 45.00),
  (26, 1, 3, 35.00), (26, 24, 1, 85.00),
  (27, 6, 1, 35.00), (27, 10, 1, 55.00),
  (28, 15, 1, 80.00), (28, 17, 1, 60.00),
  (29, 2, 2, 40.00), (29, 12, 1, 40.00),
  (30, 3, 2, 50.00), (30, 9, 1, 75.00),
  (31, 13, 1, 95.00), (31, 16, 1, 40.00),
  (32, 4, 1, 55.00), (32, 10, 2, 55.00),
  (33, 1, 2, 35.00), (33, 22, 1, 70.00),
  (34, 19, 1, 120.00), (34, 18, 1, 45.00),
  (35, 7, 1, 35.00), (35, 9, 1, 75.00),
  (36, 3, 3, 50.00), (36, 12, 1, 40.00),
  (37, 14, 1, 85.00), (37, 17, 1, 60.00),
  (38, 2, 2, 40.00), (38, 10, 1, 55.00),
  (39, 6, 1, 35.00), (39, 24, 1, 85.00),
  (40, 1, 2, 35.00), (40, 9, 1, 75.00),
  (41, 15, 1, 80.00), (41, 16, 1, 40.00),
  (42, 4, 2, 55.00), (42, 12, 1, 40.00),
  -- Febrero (órdenes 43-53)
  (43, 1, 2, 35.00), (43, 10, 1, 55.00),
  (44, 3, 1, 50.00), (44, 9, 1, 75.00),
  (45, 13, 1, 95.00), (45, 18, 1, 45.00),
  (46, 7, 2, 35.00), (46, 12, 1, 40.00),
  (47, 2, 3, 40.00), (47, 22, 1, 70.00),
  (48, 19, 1, 120.00), (48, 16, 1, 40.00),
  (49, 4, 1, 55.00), (49, 10, 2, 55.00),
  (50, 14, 1, 85.00), (50, 17, 1, 60.00),
  (51, 6, 1, 35.00), (51, 9, 1, 75.00),
  (52, 3, 2, 50.00), (52, 24, 1, 85.00),
  (53, 1, 3, 35.00), (53, 12, 1, 40.00);

-- Payments (1 payment por orden pagada)
INSERT INTO payments (order_id, method, paid_amount) VALUES
  -- Enero
  (1, 'efectivo', 125.00),
  (2, 'tarjeta', 125.00),
  (3, 'app_digital', 150.00),
  (4, 'efectivo', 105.00),
  (5, 'tarjeta', 135.00),
  (6, 'app_digital', 215.00),
  (7, 'efectivo', 110.00),
  (8, 'tarjeta', 160.00),
  (9, 'efectivo', 140.00),
  (10, 'app_digital', 145.00),
  (11, 'tarjeta', 140.00),
  -- orden 12 cancelada, no tiene pago
  (13, 'efectivo', 135.00),
  (14, 'tarjeta', 110.00),
  (15, 'app_digital', 125.00),
  (16, 'efectivo', 155.00),
  (17, 'tarjeta', 160.00),
  (18, 'app_digital', 105.00),
  (19, 'efectivo', 145.00),
  (20, 'tarjeta', 155.00),
  (21, 'efectivo', 160.00),
  (22, 'app_digital', 165.00),
  (23, 'tarjeta', 130.00),
  (24, 'efectivo', 145.00),
  (25, 'app_digital', 130.00),
  (26, 'tarjeta', 190.00),
  (27, 'efectivo', 90.00),
  (28, 'app_digital', 140.00),
  (29, 'tarjeta', 120.00),
  (30, 'efectivo', 175.00),
  (31, 'app_digital', 135.00),
  (32, 'tarjeta', 165.00),
  (33, 'efectivo', 140.00),
  (34, 'app_digital', 165.00),
  (35, 'tarjeta', 110.00),
  (36, 'efectivo', 190.00),
  (37, 'app_digital', 145.00),
  (38, 'tarjeta', 135.00),
  (39, 'efectivo', 120.00),
  (40, 'app_digital', 145.00),
  (41, 'tarjeta', 120.00),
  (42, 'efectivo', 150.00),
  -- Febrero
  (43, 'efectivo', 125.00),
  (44, 'tarjeta', 125.00),
  (45, 'app_digital', 140.00),
  (46, 'efectivo', 110.00),
  (47, 'tarjeta', 190.00),
  (48, 'app_digital', 160.00),
  (49, 'efectivo', 165.00),
  (50, 'tarjeta', 145.00),
  (51, 'app_digital', 110.00),
  (52, 'efectivo', 185.00),
  (53, 'tarjeta', 145.00);

COMMIT;
