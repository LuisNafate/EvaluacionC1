-- 05_roles.sql
-- Configuracion de seguridad: creamos un usuario que solo pueda ver las views
BEGIN;

-- Primero creamos el schema donde van a estar las views
CREATE SCHEMA IF NOT EXISTS reports;

-- Creamos el usuario app_user (si no existe)
-- Nota: en produccion este usuario deberia tener password configurado via variables de entorno
-- Para este proyecto de desarrollo, no necesita password ya que solo tiene permisos de lectura
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user WITH LOGIN;
  END IF;
END
$$;

-- Le quitamos todos los permisos que pudiera tener
REVOKE ALL ON DATABASE cafeteria FROM app_user;
REVOKE ALL ON SCHEMA public FROM app_user;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM app_user;

-- Ahora le damos solo lo que necesita
GRANT CONNECT ON DATABASE cafeteria TO app_user;  -- puede conectarse
GRANT USAGE ON SCHEMA reports TO app_user;  -- puede usar el schema reports
GRANT SELECT ON ALL TABLES IN SCHEMA reports TO app_user;  -- puede hacer SELECT en las views

-- Para futuras views que creemos
ALTER DEFAULT PRIVILEGES IN SCHEMA reports GRANT SELECT ON TABLES TO app_user;

COMMIT;

-- Para probar que funciona:
-- 1. Conectarse: psql -U app_user -d cafeteria -h localhost
-- 2. Intentar: SELECT * FROM reports.vw_sales_daily LIMIT 5;  (debe funcionar)
-- 3. Intentar: SELECT * FROM orders LIMIT 5;  (debe dar error)
