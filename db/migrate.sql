-- migrate.sql
-- Ejecuta todos los scripts en orden

\i /docker-entrypoint-initdb.d/01_schema.sql
\i /docker-entrypoint-initdb.d/02_seed.sql
\i /docker-entrypoint-initdb.d/03_reports_vw.sql
\i /docker-entrypoint-initdb.d/04_indexes.sql
\i /docker-entrypoint-initdb.d/05_roles.sql

