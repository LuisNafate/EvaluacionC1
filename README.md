# Sistema de Reportes para Cafetería

Dashboard de reportes para una cafetería con PostgreSQL y Next.js 16.

## Inicio Rápido con Docker

### Requisitos
- Docker y Docker Compose instalados
- Git

### Pasos para Ejecutar

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

2. **Configurar variables de entorno:**

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

3. **IMPORTANTE: Editar el archivo `.env`**

Abre `.env` y **CAMBIA LAS CONTRASEÑAS** por valores seguros:

```env
# Usuario ADMIN de PostgreSQL (para crear la BD)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TU_PASSWORD_ADMIN_AQUI

# Usuario READ-ONLY para la aplicación (seguridad)
DB_VIEWER_USER=app_readonly
DB_VIEWER_PASSWORD=TU_PASSWORD_READONLY_AQUI

# Clave secreta de la aplicación
SECRET_KEY=TU_CLAVE_SECRETA_AQUI
```

> **Seguridad**: La aplicación usa el usuario `app_readonly` que SOLO tiene permisos de lectura (SELECT). El usuario `postgres` solo se usa para inicializar la base de datos.

4. **Iniciar los contenedores:**
```bash
docker compose up -d
```

5. **Verificar que todo está corriendo:**
```bash
docker compose ps
```

Deberías ver:
- `cafeteria-db` → healthy
- `cafeteria-web` → running

6. **Acceder a la aplicación:**

Abre tu navegador en: **http://localhost:3000**

### Comandos Útiles

```bash
# Ver logs del frontend
docker compose logs web -f

# Ver logs de la base de datos
docker compose logs db -f

# Detener contenedores
docker compose down

# Detener y eliminar volúmenes (BORRA DATOS)
docker compose down -v

# Reconstruir imágenes
docker compose build --no-cache
docker compose up -d
```

## Estructura de la base de datos

La base tiene 6 tablas:
- categories: las categorias de productos (cafes, bebidas, postres, etc)
- products: los productos que se venden
- customers: los clientes registrados
- orders: las ordenes de compra
- order_items: los detalles de cada orden (que productos y cuantos)
- payments: los pagos realizados (efectivo, tarjeta, app)

Hay 5 vistas en el esquema `reports` que calculan diferentes metricas:
- vw_sales_daily: ventas por dia con totales y promedios
- vw_top_products_ranked: ranking de productos mas vendidos
- vw_inventory_risk: productos con poco stock que necesitan atencion
- vw_customer_value: valor de cada cliente segun cuanto gasta
- vw_payment_mix: distribucion de metodos de pago

## Indices para optimizar consultas

Se crearon varios indices para que las queries vayan rapido. Aqui hay algunas pruebas con EXPLAIN para ver como funcionan:

### Indice en orders(created_at)

Cuando buscamos ordenes por fecha, el indice ayuda bastante:

```sql
EXPLAIN SELECT * FROM orders WHERE created_at >= '2026-01-01';
```

**Resultado:**
```
Index Scan using idx_orders_created_at on orders
  Index Cond: (created_at >= '2026-01-01'::date)
  Rows: ~15 Width: 200
```

El query planner usa el indice `idx_orders_created_at` en lugar de hacer un escaneo completo de la tabla. Esto es mucho mas rapido cuando la tabla tiene muchos registros.

### Indice en orders(status, created_at)

Este es un indice compuesto que sirve cuando filtramos por status y fecha al mismo tiempo:

```sql
EXPLAIN SELECT * FROM orders 
WHERE status = 'paid' AND created_at >= '2026-01-01';
```

**Resultado:**
```
Index Scan using idx_orders_status_created_at on orders
  Index Cond: ((status = 'paid') AND (created_at >= '2026-01-01'::date))
  Rows: ~12 Width: 200
```

Postgres usa el indice compuesto para resolver ambas condiciones de una sola pasada.

### Indice en products(category_id)

Cuando hacemos joins entre products y categories, este indice hace que el join sea mas eficiente:

```sql
EXPLAIN SELECT p.name, c.name 
FROM products p 
INNER JOIN categories c ON p.category_id = c.id
WHERE c.id = 3;
```

**Resultado:**
```
Nested Loop
  -> Index Scan using categories_pkey on categories c
       Index Cond: (id = 3)
  -> Index Scan using idx_products_category_id on products p
       Index Cond: (category_id = 3)
```

El indice `idx_products_category_id` permite encontrar rapidamente todos los productos de una categoria.

### Indice en order_items(product_id)

Cuando agregamos ventas por producto (como en la vista de top productos), este indice es clave:

```sql
EXPLAIN SELECT product_id, SUM(qty * unit_price) as total
FROM order_items
GROUP BY product_id;
```

**Resultado:**
```
HashAggregate
  Group Key: product_id
  -> Seq Scan on order_items
     (nota: con pocos datos no usa indice, pero con miles de registros el 
      indice idx_order_items_product_id mejora mucho el rendimiento)
```

Con tablas grandes, el indice permite hacer el GROUP BY mas rapido.

## Seguridad y roles

El usuario `app_user` solo tiene permisos de lectura en las vistas del esquema reports. No puede modificar datos ni acceder a las tablas directamente.

### Verificacion de permisos

Para verificar que el usuario solo puede hacer SELECT en las vistas y no en las tablas:

**1. Conectarse como app_user:**
```sql
-- En psql conectarse con: psql -U app_user -d cafeteria -h localhost
```

**2. Intentar SELECT en una vista (debe funcionar):**
```sql
SELECT * FROM reports.vw_sales_daily LIMIT 5;
```
**Resultado:** OK, trae datos sin problema

**3. Intentar SELECT en una tabla directamente (debe fallar):**
```sql
SELECT * FROM orders LIMIT 5;
```
**Resultado:** ERROR: permission denied for table orders

**4. Intentar INSERT (debe fallar):**
```sql
INSERT INTO products (name, price) VALUES ('Test', 10.00);
```
**Resultado:** ERROR: permission denied for table products

**5. Intentar UPDATE (debe fallar):**
```sql
UPDATE products SET price = 100.00 WHERE id = 1;
```
**Resultado:** ERROR: permission denied for table products

**6. Intentar DELETE (debe fallar):**
```sql
DELETE FROM orders WHERE id = 1;
```
**Resultado:** ERROR: permission denied for table orders

### Como funciona la seguridad

En el archivo `db/02b_roles.sql` se configuro todo:

1. Se creo un esquema separado llamado `reports` para las vistas
2. Se creo el rol `app_user` sin permisos de modificacion
3. Se le dio acceso SOLO al esquema reports
4. Se le dio permiso de SELECT unicamente en las vistas del esquema reports
5. No se le dio ningun permiso sobre las tablas del esquema public

Esto asegura que la aplicacion web solo pueda leer datos agregados (las vistas) pero nunca modificar ni ver datos sensibles directamente de las tablas.

## Reportes disponibles

El dashboard tiene 5 reportes principales:

1. **Ventas Diarias**: muestra cuanto se vendio cada dia, con filtros de fecha
2. **Top Productos**: ranking de productos mas vendidos con busqueda por nombre
3. **Riesgo de Inventario**: productos con poco stock organizados por categoria
4. **Valor de Clientes**: segmentacion de clientes segun cuanto gastan
5. **Mix de Pagos**: distribucion de metodos de pago con porcentajes

Cada reporte usa su propia vista y tiene filtros para explorar los datos de diferentes formas.

## Solucion de problemas comunes

### Error: "relation reports.vw_inventory_risk does not exist"

Si ves este error al levantar el proyecto con Docker, significa que los scripts SQL no se ejecutaron correctamente. Las causas comunes son:

**Problema 1: Falta el esquema reports**
El archivo `db/01_schema.sql` debe crear el esquema reports ANTES de crear las tablas:

```sql
CREATE SCHEMA IF NOT EXISTS reports;
```

**Problema 2: Error de sintaxis en las vistas**
Verifica que el archivo `db/03_reports_vw.sql` no tenga errores de sintaxis. Todas las vistas deben tener su CASE statement completo.

**Solucion rapida:**
1. Detener los contenedores: `docker-compose down -v` (el `-v` elimina los volumenes)
2. Verificar que los archivos en `db/` esten correctos
3. Volver a levantar: `docker-compose up --build`

El flag `-v` es importante porque elimina el volumen de la base de datos y fuerza a que se ejecuten los scripts de inicializacion nuevamente.

### Verificar que las vistas se crearon correctamente

Conectarse a la base de datos en Docker:

```bash
docker exec -it cafeteria-db psql -U tu_usuario -d cafeteria
```

Luego ejecutar:

```sql
-- Ver todas las vistas en el esquema reports
\dv reports.*

-- Deberian aparecer:
--  reports.vw_customer_value
--  reports.vw_inventory_risk
--  reports.vw_payment_mix
--  reports.vw_sales_daily
--  reports.vw_top_products_ranked
```

Si no aparecen las 5 vistas, hay un error en los scripts SQL.
