-- ========================================
-- Script para crear usuario READ-ONLY
-- ========================================
-- Este usuario solo tendrá permisos de SELECT sobre las VIEWS
-- NO tiene acceso a tablas base, INSERT, UPDATE o DELETE

-- 1. Crear usuario read-only
CREATE USER app_readonly WITH PASSWORD 'contra123';

-- 2. Conectarse a la base de datos
\c cafeteria;

-- 3. Revocar todos los permisos por defecto
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_readonly;
REVOKE ALL ON ALL TABLES IN SCHEMA reports FROM app_readonly;

-- 4. Dar permisos SOLO sobre las VIEWS del schema reports
GRANT USAGE ON SCHEMA reports TO app_readonly;
GRANT SELECT ON reports.vw_inventory_risk TO app_readonly;
GRANT SELECT ON reports.vw_sales_daily TO app_readonly;
GRANT SELECT ON reports.vw_top_products_ranked TO app_readonly;
GRANT SELECT ON reports.vw_customer_value TO app_readonly;
GRANT SELECT ON reports.vw_payment_mix TO app_readonly;

-- 5. Asegurarse de que NO tiene acceso a tablas base
REVOKE ALL ON public.products FROM app_readonly;
REVOKE ALL ON public.categories FROM app_readonly;
REVOKE ALL ON public.orders FROM app_readonly;
REVOKE ALL ON public.order_items FROM app_readonly;
REVOKE ALL ON public.customers FROM app_readonly;
REVOKE ALL ON public.payments FROM app_readonly;

-- ========================================
-- Verificación de Seguridad
-- ========================================

-- Verificar permisos otorgados
SELECT 
    grantee, 
    table_schema,
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = 'app_readonly'
ORDER BY table_schema, table_name;

-- El resultado debería mostrar SOLO SELECT sobre las VIEWS

-- ========================================
-- Pruebas de Seguridad
-- ========================================

-- Para probar la seguridad, ejecuta estos comandos:

-- 1. Conectarse como app_readonly
-- \c cafeteria app_readonly

-- 2. Esto debería funcionar (SELECT sobre VIEW):
-- SELECT * FROM reports.vw_sales_daily LIMIT 5;

-- 3. Esto debería FALLAR (acceso a tabla):
-- SELECT * FROM products LIMIT 5;
-- Resultado esperado: ERROR: permission denied for table products

-- 4. Esto debería FALLAR (INSERT):
-- INSERT INTO products (name, price) VALUES ('Test', 10.00);
-- Resultado esperado: ERROR: permission denied for table products

-- ========================================
-- Notas Importantes
-- ========================================

/*
1. Cambia 'your_secure_password_here_change_me' por una contraseña segura
2. Actualiza tu .env con:
   DATABASE_URL=postgresql://app_readonly:tu_password@localhost:5432/cafeteria

3. Para ejecutar este script:
   - Desde contenedor Docker:
     docker exec -it [nombre_contenedor] psql -U postgres -d cafeteria -f /path/to/this/file.sql
   
   - Desde local:
     psql -U postgres -d cafeteria -f db/05_create_readonly_user.sql

4. Principio de Seguridad:
   Si hay vulnerabilidad SQL injection, el atacante SOLO podrá leer VIEWS,
   NO podrá modificar datos ni acceder a tablas sensibles.
*/
