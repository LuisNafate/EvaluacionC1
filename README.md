# Sistema de Reportes para Cafeteria

Este proyecto es un dashboard de reportes para una cafeteria que vende diferentes productos. Usa PostgreSQL para guardar la info y Next.js para mostrar los reportes en el navegador.

## Como levantar el proyecto

### Opcion 1: Con Docker (recomendado)

**Requisitos:**
- Docker y Docker Compose instalados

**Pasos:**

1. **Clonar el repositorio:**
```bash
git clone https://github.com/LuisNafate/EvaluacionC1.git
cd EvaluacionC1
```

2. **Crear el archivo .env con las credenciales:**

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita el archivo `.env` y configura las credenciales de PostgreSQL:
```env
POSTGRES_DB=cafeteria
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin
```

Nota: Puedes cambiar los valores por los que prefieras, pero asegurate de que coincidan en todas las variables.

3. **Levantar los contenedores:**
```bash
docker-compose up --build
```

4. **Acceder a la aplicacion:**

Espera unos segundos hasta que los contenedores esten listos (veras el mensaje "Ready" en la consola). Despues abre tu navegador en:

**http://localhost:3000**

Para detener el proyecto: presiona `Ctrl+C` en la terminal, o ejecuta:
```bash
docker-compose down
```

### Opcion 2: Con base de datos local (sin Docker)

Si ya tienes PostgreSQL instalado en tu maquina:

1. **Crear la base de datos:**
```bash
createdb cafeteria
```

2. **Configurar variables de entorno:**

Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

Edita `.env.local` y configura tu conexion local:
```env
DATABASE_URL=postgresql://tu_usuario:tu_password@localhost:5432/cafeteria
```

3. **Ejecutar los scripts SQL en orden:**
```bash
psql -U tu_usuario -d cafeteria -f db/01_schema.sql
psql -U tu_usuario -d cafeteria -f db/02_seed.sql
psql -U tu_usuario -d cafeteria -f db/02b_roles.sql
psql -U tu_usuario -d cafeteria -f db/03_reports_vw.sql
psql -U tu_usuario -d cafeteria -f db/04_indexes.sql
```

4. **Instalar dependencias y ejecutar:**
```bash
npm install
npm run dev
```

El proyecto estara en **http://localhost:3000**

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

